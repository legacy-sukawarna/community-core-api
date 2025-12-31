import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus, EventLinkType, Role } from '@prisma/client';
import {
  CreateEventNoticeDto,
  UpdateEventNoticeDto,
  EventNoticeQueryDto,
} from './dto/event-notice.dto';

@Injectable()
export class EventNoticeService {
  private readonly logger = new Logger(EventNoticeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Auto-detect link type based on link format
   * - Starts with "/" = INTERNAL
   * - Starts with "http://" or "https://" = EXTERNAL
   * - Default to INTERNAL if ambiguous
   */
  private detectLinkType(link: string | undefined | null): EventLinkType {
    if (!link) return EventLinkType.INTERNAL;

    if (link.startsWith('http://') || link.startsWith('https://')) {
      return EventLinkType.EXTERNAL;
    }

    return EventLinkType.INTERNAL;
  }

  async createEventNotice(data: CreateEventNoticeDto, authorId: string) {
    // Auto-detect link type if not provided
    const linkType = data.link_type || this.detectLinkType(data.link);

    return this.prisma.eventNotice.create({
      data: {
        title: data.title,
        description: data.description,
        poster_url: data.poster_url,
        link: data.link,
        link_type: linkType,
        author_id: authorId,
        status: EventStatus.DRAFT,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAllEventNotices(
    query: EventNoticeQueryDto,
    includeAllStatuses = false,
  ) {
    const { status, page = 1, limit = 10 } = query;

    const where: any = {};

    // Only show published event notices for public access
    if (!includeAllStatuses) {
      where.status = EventStatus.PUBLISHED;
    } else if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [eventNotices, total] = await Promise.all([
      this.prisma.eventNotice.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.eventNotice.count({ where }),
    ]);

    return {
      results: eventNotices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findPublishedEventNotices() {
    return this.prisma.eventNotice.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { published_at: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findEventNoticeById(id: string) {
    const eventNotice = await this.prisma.eventNotice.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!eventNotice) {
      throw new NotFoundException(`Event notice with ID ${id} not found`);
    }

    return eventNotice;
  }

  async updateEventNotice(
    id: string,
    data: UpdateEventNoticeDto,
    userId: string,
    userRole: Role,
  ) {
    const eventNotice = await this.findEventNoticeById(id);

    // EVENT_MANAGER can only edit their own event notices (unless ADMIN)
    if (
      userRole === Role.EVENT_MANAGER &&
      eventNotice.author_id !== userId
    ) {
      throw new ForbiddenException(
        'You can only edit your own event notices',
      );
    }

    // Auto-detect link type if link is being updated and link_type not provided
    let linkType = data.link_type;
    if (data.link && !data.link_type) {
      linkType = this.detectLinkType(data.link);
    }

    return this.prisma.eventNotice.update({
      where: { id },
      data: {
        ...data,
        link_type: linkType || eventNotice.link_type,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteEventNotice(id: string, userId: string, userRole: Role) {
    const eventNotice = await this.findEventNoticeById(id);

    // EVENT_MANAGER can only delete their own event notices (unless ADMIN)
    if (
      userRole === Role.EVENT_MANAGER &&
      eventNotice.author_id !== userId
    ) {
      throw new ForbiddenException(
        'You can only delete your own event notices',
      );
    }

    return this.prisma.eventNotice.delete({ where: { id } });
  }

  async publishEventNotice(id: string, userId: string, userRole: Role) {
    const eventNotice = await this.findEventNoticeById(id);

    // EVENT_MANAGER can only publish their own event notices (unless ADMIN)
    if (
      userRole === Role.EVENT_MANAGER &&
      eventNotice.author_id !== userId
    ) {
      throw new ForbiddenException(
        'You can only publish your own event notices',
      );
    }

    return this.prisma.eventNotice.update({
      where: { id },
      data: {
        status: EventStatus.PUBLISHED,
        published_at: new Date(),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async unpublishEventNotice(id: string, userId: string, userRole: Role) {
    const eventNotice = await this.findEventNoticeById(id);

    // EVENT_MANAGER can only unpublish their own event notices (unless ADMIN)
    if (
      userRole === Role.EVENT_MANAGER &&
      eventNotice.author_id !== userId
    ) {
      throw new ForbiddenException(
        'You can only unpublish your own event notices',
      );
    }

    return this.prisma.eventNotice.update({
      where: { id },
      data: {
        status: EventStatus.DRAFT,
        published_at: null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}

