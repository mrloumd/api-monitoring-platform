import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
  'application/zip',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

@ApiTags('demo')
@Controller('demo')
@UseInterceptors(LoggingInterceptor)
export class DemoController {
  // -------------------------------------------------------------------------
  // POST /demo/files/upload
  // -------------------------------------------------------------------------
  @Post('files/upload')
  @ApiOperation({ summary: 'Simulate file upload — accepts real file, no DB persistence' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadFile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Send a multipart/form-data request with field name "file".',
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not supported. Allowed: pdf, jpg, png, webp, gif, txt, csv, docx, xlsx, zip.`,
      );
    }

    // Processing time loosely proportional to file size
    const processingMs = Math.min(rand(800, 2000) + Math.floor(file.size / 50000), 4000);
    await delay(processingMs);

    if (Math.random() < 0.05) {
      throw new HttpException(
        'Storage service temporarily unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? 'bin';
    const fileId = `file_${Math.random().toString(36).slice(2, 12)}`;

    return {
      fileId,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      extension: ext,
      checksum: `sha256:${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      status: 'processed',
      url: `/storage/files/${fileId}.${ext}`,
      processingTimeMs: processingMs,
      createdAt: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // POST /demo/users
  // -------------------------------------------------------------------------
  @Post('users')
  @HttpCode(201)
  @ApiOperation({ summary: 'Simulate user registration with email validation' })
  async createUser(@Body() dto: CreateUserDto) {
    await delay(rand(150, 500));

    const r = Math.random();
    if (r < 0.05)
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    if (r < 0.25)
      throw new HttpException(
        { statusCode: 409, message: 'Email already registered', email: dto.email },
        HttpStatus.CONFLICT,
      );

    return {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      name: dto.name,
      email: dto.email,
      role: 'user',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // POST /demo/auth/login
  // -------------------------------------------------------------------------
  @Post('auth/login')
  @ApiOperation({ summary: 'Simulate authentication with email + password validation' })
  async login(@Body() dto: LoginDto) {
    await delay(rand(100, 400));

    const r = Math.random();
    if (r < 0.05)
      throw new HttpException('Authentication service error', HttpStatus.INTERNAL_SERVER_ERROR);
    if (r < 0.35)
      throw new HttpException(
        { statusCode: 401, message: 'Invalid email or password' },
        HttpStatus.UNAUTHORIZED,
      );

    return {
      accessToken: `eyJhbGciOiJIUzI1NiJ9.${Math.random().toString(36).slice(2, 30)}.${Math.random().toString(36).slice(2, 20)}`,
      refreshToken: `rt_${Math.random().toString(36).slice(2, 40)}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        email: dto.email,
        role: 'user',
      },
    };
  }

  // -------------------------------------------------------------------------
  // GET /demo/products
  // -------------------------------------------------------------------------
  @Get('products')
  @ApiOperation({ summary: 'Simulate paginated product listing' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    await delay(rand(50, 300));

    if (Math.random() < 0.03)
      throw new HttpException('Database query timeout', HttpStatus.INTERNAL_SERVER_ERROR);

    const total = rand(80, 500);
    const CATEGORIES = ['electronics', 'clothing', 'books', 'home', 'sports'];

    return {
      data: Array.from({ length: Number(limit) }, () => ({
        id: `prod_${Math.random().toString(36).slice(2, 10)}`,
        name: `Product ${rand(1, 999)}`,
        price: parseFloat((rand(999, 99999) / 100).toFixed(2)),
        category: CATEGORIES[rand(0, 4)],
        stock: rand(0, 200),
        createdAt: new Date(Date.now() - rand(0, 30) * 86400000).toISOString(),
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  // -------------------------------------------------------------------------
  // POST /demo/ai/analyze
  // -------------------------------------------------------------------------
  @Post('ai/analyze')
  @ApiOperation({ summary: 'Simulate heavy AI processing task (2–6s delay)' })
  async analyzeWithAI(@Body() body: Record<string, unknown>) {
    await delay(rand(2000, 6000));

    const r = Math.random();
    if (r < 0.05)
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    if (r < 0.20)
      throw new HttpException(
        'AI model is overloaded, retry later',
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    const SENTIMENTS = ['positive', 'negative', 'neutral'];
    const processingMs = rand(1800, 5800);

    return {
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
      model: 'claude-3-5-sonnet',
      status: 'completed',
      input: String(body.text ?? 'Sample input text...').slice(0, 80),
      result: {
        sentiment: SENTIMENTS[rand(0, 2)],
        confidence: parseFloat((Math.random() * 0.35 + 0.65).toFixed(4)),
        entities: rand(1, 8),
        tokens: rand(120, 800),
        summary: 'Analysis completed successfully.',
      },
      usage: {
        inputTokens: rand(50, 400),
        outputTokens: rand(80, 300),
      },
      processingTimeMs: processingMs,
      createdAt: new Date().toISOString(),
    };
  }
}
