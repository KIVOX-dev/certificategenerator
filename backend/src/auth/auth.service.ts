import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { AppException } from '../common/app.exception';
import { User, UserDoc } from '../database/schemas';

// Compared against when the email is unknown so response time does not reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private users: Model<User>, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ email: email.toLowerCase().trim() });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new AppException('INVALID_CREDENTIALS', 'Incorrect email or password.', 401);
    const token = await this.jwt.signAsync({ sub: String(user._id), role: user.role });
    return { token, user: this.publicUser(user) };
  }

  publicUser(u: UserDoc) {
    return { id: String(u._id), name: u.name, email: u.email, role: u.role };
  }

  async verify(token: string): Promise<UserDoc | null> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      return await this.users.findById(payload.sub);
    } catch {
      return null;
    }
  }

  async ensureAdmin(email: string, password: string, name = 'Administrator') {
    const existing = await this.users.findOne({ email: email.toLowerCase() });
    if (existing) return existing;
    return this.users.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'SUPER_ADMIN' });
  }
}
