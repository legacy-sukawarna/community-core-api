import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/guard/roles.decorator';
import { BlogService } from './blog.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';
import { PostStatus } from '@prisma/client';
import { SupabaseService } from 'src/services/supabase/supabase.service';

// ============ Packages Controller ============

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'List all packages (public)' })
  @ApiResponse({ status: 200, description: 'List of packages retrieved' })
  async findAll() {
    return this.blogService.findAllPackages();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package by ID with published posts (public)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package retrieved' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findOne(@Param('id') id: string) {
    return this.blogService.findPackageById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get package by slug with published posts (public)',
  })
  @ApiParam({ name: 'slug', description: 'Package slug' })
  @ApiResponse({ status: 200, description: 'Package retrieved' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findPackageBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new package (ADMIN only)' })
  @ApiBody({ type: CreatePackageDto })
  @ApiResponse({ status: 201, description: 'Package created' })
  async create(@Body() data: CreatePackageDto) {
    return this.blogService.createPackage(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a package (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiBody({ type: UpdatePackageDto })
  @ApiResponse({ status: 200, description: 'Package updated' })
  async update(@Param('id') id: string, @Body() data: UpdatePackageDto) {
    return this.blogService.updatePackage(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a package (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package deleted' })
  async remove(@Param('id') id: string) {
    return this.blogService.deletePackage(id);
  }
}

// ============ Posts Controller ============

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly blogService: BlogService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Public endpoints

  @Get()
  @ApiOperation({ summary: 'List published posts (public)' })
  @ApiQuery({
    name: 'package_id',
    required: false,
    description: 'Filter by package',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of posts retrieved' })
  async findAll(@Query() query: PostQueryDto) {
    return this.blogService.findAllPosts(query, false);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get published post by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @ApiResponse({ status: 200, description: 'Post retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findPostBySlug(slug, true);
  }

  // Admin/Writer endpoints

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all posts including drafts (ADMIN/WRITER)' })
  @ApiQuery({ name: 'package_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'author_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of posts retrieved' })
  async findAllAdmin(@Query() query: PostQueryDto, @Req() request) {
    // WRITER can only see their own posts
    if (request.user.role === 'WRITER') {
      query.author_id = request.user.id;
    }
    return this.blogService.findAllPosts(query, true);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get post by ID (ADMIN/WRITER)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.blogService.findPostById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post (ADMIN/WRITER)' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created' })
  async create(@Body() data: CreatePostDto, @Req() request) {
    return this.blogService.createPost(data, request.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post (ADMIN/WRITER)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
    @Req() request,
  ) {
    return this.blogService.updatePost(
      id,
      data,
      request.user.id,
      request.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post (ADMIN/WRITER)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted' })
  async remove(@Param('id') id: string, @Req() request) {
    return this.blogService.deletePost(id, request.user.id, request.user.role);
  }

  @Patch(':id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a post (ADMIN/WRITER)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post published' })
  async publish(@Param('id') id: string, @Req() request) {
    return this.blogService.publishPost(id, request.user.id, request.user.role);
  }

  @Patch(':id/unpublish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a post (ADMIN/WRITER)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post unpublished' })
  async unpublish(@Param('id') id: string, @Req() request) {
    return this.blogService.unpublishPost(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @Post('upload-image')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'WRITER')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for post content' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      );
    }

    // Create a modified file object with unique filename
    const uniqueFile = {
      ...file,
      originalname: `blog/${Date.now()}-${file.originalname}`,
    };

    // Upload to Supabase Storage using the existing method
    const url = await this.supabaseService.uploadFile(
      'blog-images',
      uniqueFile,
    );

    return { url };
  }
}
