import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PackagesController, PostsController } from './blog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from 'src/services/supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  providers: [BlogService],
  controllers: [PackagesController, PostsController],
  exports: [BlogService],
})
export class BlogModule {}

