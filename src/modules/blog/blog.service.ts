import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus, Role } from '@prisma/client';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ Package Methods ============

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async createPackage(data: CreatePackageDto) {
    const slug = data.slug || this.generateSlug(data.name);

    // Check for slug uniqueness
    const existing = await this.prisma.package.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Package with slug "${slug}" already exists`);
    }

    return this.prisma.package.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
      },
    });
  }

  async findAllPackages() {
    return this.prisma.package.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findPackageById(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        posts: {
          where: { status: PostStatus.PUBLISHED },
          orderBy: { published_at: 'desc' },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return pkg;
  }

  async findPackageBySlug(slug: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { status: PostStatus.PUBLISHED },
          orderBy: { published_at: 'desc' },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with slug "${slug}" not found`);
    }

    return pkg;
  }

  async updatePackage(id: string, data: UpdatePackageDto) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    // If slug is being updated, check uniqueness
    if (data.slug && data.slug !== pkg.slug) {
      const existing = await this.prisma.package.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException(
          `Package with slug "${data.slug}" already exists`,
        );
      }
    }

    return this.prisma.package.update({
      where: { id },
      data,
    });
  }

  async deletePackage(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    if (pkg._count.posts > 0) {
      throw new ConflictException(
        `Cannot delete package with existing posts. Delete or move the posts first.`,
      );
    }

    return this.prisma.package.delete({ where: { id } });
  }

  // ============ Post Methods ============

  async createPost(data: CreatePostDto, authorId: string) {
    const slug = data.slug || this.generateSlug(data.title);

    // Check slug uniqueness
    const existing = await this.prisma.post.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Post with slug "${slug}" already exists`);
    }

    // Verify package exists
    const pkg = await this.prisma.package.findUnique({
      where: { id: data.package_id },
    });
    if (!pkg) {
      throw new NotFoundException(
        `Package with ID ${data.package_id} not found`,
      );
    }

    return this.prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        package_id: data.package_id,
        author_id: authorId,
        status: PostStatus.DRAFT,
      },
      include: {
        package: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAllPosts(query: PostQueryDto, includeAllStatuses = false) {
    const {
      package_id,
      status,
      author_id,
      search,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    // Only show published posts for public access
    if (!includeAllStatuses) {
      where.status = PostStatus.PUBLISHED;
    } else if (status) {
      where.status = status;
    }

    if (package_id) {
      where.package_id = package_id;
    }

    if (author_id) {
      where.author_id = author_id;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
        include: {
          package: true,
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      results: posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        package: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findPostBySlug(slug: string, requirePublished = true) {
    const where: any = { slug };

    if (requirePublished) {
      where.status = PostStatus.PUBLISHED;
    }

    const post = await this.prisma.post.findFirst({
      where,
      include: {
        package: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    return post;
  }

  async updatePost(
    id: string,
    data: UpdatePostDto,
    userId: string,
    userRole: Role,
  ) {
    const post = await this.findPostById(id);

    // WRITER can only edit their own posts
    if (userRole === Role.WRITER && post.author_id !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    // If slug is being updated, check uniqueness
    if (data.slug && data.slug !== post.slug) {
      const existing = await this.prisma.post.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException(
          `Post with slug "${data.slug}" already exists`,
        );
      }
    }

    // If package is being updated, verify it exists
    if (data.package_id && data.package_id !== post.package_id) {
      const pkg = await this.prisma.package.findUnique({
        where: { id: data.package_id },
      });

      if (!pkg) {
        throw new NotFoundException(
          `Package with ID ${data.package_id} not found`,
        );
      }
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        package: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deletePost(id: string, userId: string, userRole: Role) {
    const post = await this.findPostById(id);

    // WRITER can only delete their own posts
    if (userRole === Role.WRITER && post.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({ where: { id } });
  }

  async publishPost(id: string, userId: string, userRole: Role) {
    const post = await this.findPostById(id);

    // WRITER can only publish their own posts
    if (userRole === Role.WRITER && post.author_id !== userId) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
      },
      include: {
        package: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async unpublishPost(id: string, userId: string, userRole: Role) {
    const post = await this.findPostById(id);

    // WRITER can only unpublish their own posts
    if (userRole === Role.WRITER && post.author_id !== userId) {
      throw new ForbiddenException('You can only unpublish your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.DRAFT,
        published_at: null,
      },
      include: {
        package: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
