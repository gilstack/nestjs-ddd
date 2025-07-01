import { Entity, Column, Index } from 'typeorm';
import { Role, Status, AuthProvider } from '@/shared/types/enums';
import { InfrastructureBaseEntity } from '../base.entity';

@Entity('users')
export class UserEntity extends InfrastructureBaseEntity {
  @Column({ unique: true })
  @Index('idx_user_email')
  email!: string;

  @Column({ default: 'Anonymous' })
  name!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.GUEST,
  })
  @Index('idx_user_role')
  role!: Role;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  @Index('idx_user_status')
  status!: Status;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.PASSPORT,
  })
  provider!: AuthProvider;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt!: Date | null;

  /**
   * Implementation of abstract method from InfrastructureBaseEntity
   */
  protected getEntitySpecificFields(): Record<string, unknown> {
    return {
      email: this.email,
      name: this.name,
      role: this.role,
      status: this.status,
      provider: this.provider,
      verifiedAt: this.verifiedAt,
    };
  }
}
