import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BuyerProfile, SellerProfile, User } from '../database/entities';
import { ProfileDto } from '../common/dto';
@Injectable()
export class UsersService {
  constructor(private readonly db: DataSource) {}
  async me(id: string) {
    const user = await this.db.getRepository(User).findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const [buyerProfile, sellerProfile] = await Promise.all([
      this.db.getRepository(BuyerProfile).findOneBy({ userId: id }),
      this.db.getRepository(SellerProfile).findOneBy({ userId: id }),
    ]);
    return { ...user, buyerProfile, sellerProfile };
  }
  async update(id: string, dto: ProfileDto) {
    await this.db.transaction(async em => {
      if (dto.name !== undefined) await em.update(User, id, { name: dto.name });
      if (dto.sellerName !== undefined) await em.update(SellerProfile, { userId: id }, { displayName: dto.sellerName });
    });
    return this.me(id);
  }
}
