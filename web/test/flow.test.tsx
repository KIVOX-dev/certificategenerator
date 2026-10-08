import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificateView } from '@/components/CertificateView';
import { DownloadButton } from '@/components/DownloadButton';
import { RegisterFlow } from '@/components/RegisterFlow';
import { cleanName, normalizeIndianPhone, validateForm } from '@/lib/validation';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(''),
}));

const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));
const event = { eventCode: 'ABC123', name: 'First Aid Training Program', description: '', organizationName: 'ABC', open: true };
const cert = {
  status: 'ACTIVE', certificateNumber: 'CERT-2026-000001', certificateId: 'abcd', recipientName: 'Ramesh Kumar',
  eventName: 'First Aid Training Program', organizationName: 'ABC Foundation', certificateTitle: 'Certificate of Completion',
  issueDate: '2026-10-07T18:30:00.000Z', downloadable: true,
};

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  push.mockReset();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('validation', () => {
  it('accepts the supported phone formats', () => {
    for (const p of ['9876543210', '+919876543210', '+91 9876543210']) expect(normalizeIndianPhone(p)).toBe('9876543210');
    for (const p of ['', '12345', '5876543210', 'abc']) expect(normalizeIndianPhone(p)).toBeNull();
  });
  it('validates the form', () => {
    expect(validateForm('Ramesh Kumar', '9876543210')).toEqual({});
    expect(validateForm('', '1')).toEqual({ fullName: 'INVALID_NAME', phone: 'INVALID_PHONE' });
    expect(cleanName('  Ramesh   Kumar ')).toBe('Ramesh Kumar');
  });
});

describe('RegisterFlow', () => {
  it('shows an invalid link message for unknown events', async () => {
    fetchMock.mockReturnValue(json({ code: 'EVENT_NOT_FOUND' }, 404));
    render(<RegisterFlow eventCode="NOPE" />);
    expect(await screen.findByText(/event link is not valid/i)).toBeInTheDocument();
  });

  it('shows registration closed', async () => {
    fetchMock.mockReturnValue(json({ ...event, open: false }));
    render(<RegisterFlow eventCode="ABC123" />);
    expect(await screen.findByRole('heading', { name: 'Registration Closed' })).toBeInTheDocument();
  });

  it('shows clear errors under the right fields', async () => {
    fetchMock.mockReturnValue(json(event));
    render(<RegisterFlow eventCode="ABC123" />);
    await screen.findByText('First Aid Training Program');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('Please enter your full name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid 10-digit mobile number.')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('aria-invalid', 'true');
  });

  it('goes form → confirm → certificate page, and allows editing', async () => {
    fetchMock.mockImplementation((url: string) =>
      String(url).endsWith('/register') ? json({ outcome: 'CREATED', certificate: cert }) : json(event),
    );
    render(<RegisterFlow eventCode="ABC123" />);
    await screen.findByText('First Aid Training Program');
    await userEvent.type(screen.getByLabelText('Full Name'), '  ramesh   kumar ');
    await userEvent.type(screen.getByLabelText('Phone Number'), '+91 98765 43210');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByRole('heading', { name: 'Please Check Your Name' })).toBeInTheDocument();
    expect(screen.getByTestId('confirm-name')).toHaveTextContent('ramesh kumar');
    expect(screen.getByTestId('confirm-phone')).toHaveTextContent('9876543210');

    await userEvent.click(screen.getByRole('button', { name: /edit details/i }));
    expect(screen.getByLabelText('Full Name')).toHaveValue('ramesh kumar');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, continue/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/certificate/abcd?new=1'));
    const post = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/register'))!;
    expect(JSON.parse(post[1].body)).toEqual({ fullName: 'ramesh kumar', phone: '+91 98765 43210' });
  });

  it('offers the existing certificate for duplicates', async () => {
    fetchMock.mockImplementation((url: string) =>
      String(url).endsWith('/register') ? json({ outcome: 'EXISTING', certificate: cert }) : json(event),
    );
    render(<RegisterFlow eventCode="ABC123" />);
    await screen.findByText('First Aid Training Program');
    await userEvent.type(screen.getByLabelText('Full Name'), 'Ramesh Kumar');
    await userEvent.type(screen.getByLabelText('Phone Number'), '9876543210');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, continue/i }));
    expect(await screen.findByText(/existing certificate for this phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view my certificate/i })).toHaveAttribute('href', '/certificate/abcd');
  });

  it('shows a friendly network error and stays on the confirm screen', async () => {
    fetchMock.mockImplementation((url: string) =>
      String(url).endsWith('/register') ? Promise.reject(new TypeError('fail')) : json(event),
    );
    render(<RegisterFlow eventCode="ABC123" />);
    await screen.findByText('First Aid Training Program');
    await userEvent.type(screen.getByLabelText('Full Name'), 'Ramesh Kumar');
    await userEvent.type(screen.getByLabelText('Phone Number'), '9876543210');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, continue/i }));
    expect(await screen.findByText(/Unable to connect/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, continue/i })).toBeInTheDocument();
  });
});

describe('CertificateView', () => {
  it('shows the ready screen with preview and download', async () => {
    fetchMock.mockReturnValue(json(cert));
    render(<CertificateView reference="abcd" isNew />);
    expect(await screen.findByRole('heading', { name: /certificate ready/i })).toBeInTheDocument();
    expect(screen.getByText('This certificate has been issued to')).toBeInTheDocument();
    expect(screen.getByAltText('Preview of your certificate')).toHaveAttribute('src', '/api/certificates/abcd/preview');
    expect(screen.getByRole('button', { name: /download certificate/i })).toBeInTheDocument();
  });

  it('shows a valid certificate on the public page, with no phone number', async () => {
    fetchMock.mockReturnValue(json(cert));
    render(<CertificateView reference="abcd" isNew={false} />);
    expect(await screen.findByText(/VALID CERTIFICATE/)).toBeInTheDocument();
    expect(screen.getByText('CERT-2026-000001')).toBeInTheDocument();
    expect(screen.getByText('08 October 2026')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\d{10}/);
  });

  it('handles not found, revoked and expired', async () => {
    fetchMock.mockReturnValueOnce(json({ code: 'CERTIFICATE_NOT_FOUND' }, 404));
    const { unmount } = render(<CertificateView reference="x" isNew={false} />);
    expect(await screen.findByRole('heading', { name: 'Certificate Not Found' })).toBeInTheDocument();
    unmount();

    fetchMock.mockReturnValueOnce(json({ ...cert, status: 'REVOKED', recipientName: null }));
    const r = render(<CertificateView reference="x" isNew={false} />);
    expect(await screen.findByRole('heading', { name: 'Certificate Revoked' })).toBeInTheDocument();
    expect(screen.queryByText(/VALID CERTIFICATE/)).toBeNull();
    r.unmount();

    fetchMock.mockReturnValueOnce(json({ ...cert, status: 'EXPIRED' }));
    render(<CertificateView reference="x" isNew={false} />);
    expect(await screen.findByText(/Certificate Expired/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).toBeNull();
  });
});

describe('DownloadButton', () => {
  it('prepares, then confirms the download', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    // A plain object: jsdom's Blob has no stream(), which new Response(blob) needs on some Node versions.
    fetchMock.mockReturnValue(Promise.resolve({ ok: true, status: 200, blob: () => Promise.resolve(new Blob(['%PDF-'])) }));
    render(<DownloadButton certificateId="abcd" certificateNumber="CERT-2026-000001" />);
    await userEvent.click(screen.getByRole('button', { name: /download certificate/i }));
    expect(await screen.findByText('Your certificate is ready.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/certificates/abcd/pdf');
  });

  it('shows a plain error when the download fails', async () => {
    fetchMock.mockReturnValue(Promise.resolve(new Response('', { status: 500 })));
    render(<DownloadButton certificateId="abcd" certificateNumber="CERT-2026-000001" />);
    await userEvent.click(screen.getByRole('button', { name: /download certificate/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be downloaded');
  });
});
