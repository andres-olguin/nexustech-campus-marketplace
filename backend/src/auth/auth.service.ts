import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { BuyerProfile, SellerProfile, User } from '../database/entities';
import { RegisterDto, LoginDto } from '../common/dto';
import { hashPassword, verifyPassword } from './password';
@Injectable()
export class AuthService {
  constructor(private readonly db: DataSource, private readonly jwt: JwtService) {}
  async register(dto: RegisterDto) {
    const passwordHash = await hashPassword(dto.password);
    const user = await this.db.transaction(async em => {
      const user = await em.save(User, em.create(User, { email: dto.email, name: dto.name, passwordHash }));
      await em.save(BuyerProfile, em.create(BuyerProfile, { userId: user.id }));
      await em.save(SellerProfile, em.create(SellerProfile, { userId: user.id, displayName: user.name }));
      return user;
    });
    return this.session(user);
  }
  async login(dto: LoginDto) {
    const user = await this.db.getRepository(User).createQueryBuilder('u').addSelect('u.passwordHash').where('u.email = :email', { email: dto.email }).getOne();
    // Perform equivalent hashing work when email is unknown to reduce enumeration by timing.
    const valid = await verifyPassword(dto.password, user?.passwordHash || `${'0'.repeat(32)}:${'0'.repeat(128)}`);
    if (!user || !valid) throw new UnauthorizedException('Credenciales inválidas');
    return this.session(user);
  }
  private async session(user: User) {
    return { accessToken: await this.jwt.signAsync({ sub: user.id }), user: { id: user.id, email: user.email, name: user.name } };
  }
}
