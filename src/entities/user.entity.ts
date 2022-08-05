import { BeforeInsert, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { SharedEntity } from '../common/model/sharedEntity';
import { UserInfo } from 'src/user/dto/userInfo.dto';

@Entity()
export class User extends SharedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileID?: string;

  @Column({ unique: true, nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ unique: true, nullable: true })
  @Exclude()
  resetToken?: string;

  @Column({
    type: 'jsonb',
    default: [],
    nullable: true,
  })
  history: UserInfo[];

  @BeforeInsert()
  public setPassword() {
    let salt = randomBytes(32).toString('hex');
    let hash = pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString(
      'hex',
    );
    let hashedPassword = `${salt}:${hash}`;
    this.password = hashedPassword;
    return this.password;
  }
}
