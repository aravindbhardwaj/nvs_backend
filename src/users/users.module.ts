import { Module } from '@nestjs/common';
import { UserRepositoryService } from './services/user-repository/user-repository.service';

@Module({
  providers: [UserRepositoryService]
})
export class UsersModule {}
