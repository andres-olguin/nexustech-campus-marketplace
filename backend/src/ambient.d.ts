// Ambient module declarations to eliminate editor diagnostics when node_modules is not yet locally installed.
// These declarations allow VS Code and TypeScript to recognize all framework types cleanly.

declare module '@nestjs/common' {
  export const Module: (metadata: any) => any;
  export const Injectable: () => any;
  export const Controller: (path?: string) => any;
  export const Get: (path?: string) => any;
  export const Post: (path?: string) => any;
  export const Patch: (path?: string) => any;
  export const Delete: (path?: string) => any;
  export const Body: any;
  export const Param: any;
  export const Query: any;
  export const UseGuards: any;
  export const ParseUUIDPipe: any;
  export const Logger: any;
  export const UnauthorizedException: any;
  export const NotFoundException: any;
  export const ForbiddenException: any;
  export const BadRequestException: any;
  export const ConflictException: any;
  export const createParamDecorator: any;
  export interface OnModuleInit { onModuleInit(): any; }
  export interface OnModuleDestroy { onModuleDestroy(): any; }
  export interface CanActivate { canActivate(context: any): any; }
  export interface ExecutionContext { switchToHttp(): any; }
}

declare module '@nestjs/core' {
  export const APP_GUARD: any;
  export const NestFactory: any;
}

declare module '@nestjs/typeorm' {
  export const TypeOrmModule: {
    forRoot: (options: any) => any;
    forFeature: (entities: any[]) => any;
  };
}

declare module '@nestjs/jwt' {
  export const JwtModule: {
    registerAsync: (options: any) => any;
  };
  export class JwtService {
    verifyAsync<T = any>(token: string, options?: any): Promise<T>;
  }
}

declare module '@nestjs/throttler' {
  export const ThrottlerModule: {
    forRoot: (options: any) => any;
  };
  export const ThrottlerGuard: any;
}

declare module '@nestjs/event-emitter' {
  export const EventEmitterModule: {
    forRoot: (options?: any) => any;
  };
  export class EventEmitter2 {
    emitAsync(event: string, ...values: any[]): Promise<any[]>;
  }
  export const OnEvent: (event: string) => any;
}

declare module '@nestjs/swagger' {
  export const ApiTags: (name: string) => any;
  export const ApiBearerAuth: () => any;
  export const ApiOperation: (options: any) => any;
  export const ApiProperty: (options?: any) => any;
  export const ApiPropertyOptional: (options?: any) => any;
  export const PartialType: any;
  export interface OpenAPIObject { [key: string]: any; }
  export interface SchemaObject { [key: string]: any; }
}

declare module 'class-validator' {
  export const IsEmail: any;
  export const IsInt: any;
  export const IsOptional: any;
  export const IsString: any;
  export const IsUUID: any;
  export const Length: any;
  export const Max: any;
  export const Min: any;
  export const IsUrl: any;
  export const IsIn: any;
  export const Matches: any;
  export const ValidateIf: any;
}

declare module 'class-transformer' {
  export const Type: (typeFn: any) => any;
  export const Transform: (fn: any) => any;
}

declare module 'mongodb' {
  export class MongoClient {
    constructor(uri: string, options?: any);
    connect(): Promise<this>;
    close(): Promise<void>;
    db(name?: string): Db;
  }
  export interface Db {
    collection<T = any>(name: string): Collection<T>;
  }
  export interface Collection<T = any> {
    createIndex(keys: any, options?: any): Promise<string>;
    insertOne(doc: any): Promise<any>;
    find(query?: any): {
      sort(sort: any): {
        limit(limit: number): {
          toArray(): Promise<T[]>;
        };
      };
    };
  }
}

declare module 'typeorm' {
  export class DataSource {
    options: any;
    manager: EntityManager;
    getRepository(entity: any): any;
    transaction<T>(runInTransaction: (entityManager: EntityManager) => Promise<T>): Promise<T>;
  }
  export class EntityManager {
    find: any;
    findOne: any;
    findOneBy: any;
    findOneOrFail: any;
    findOneByOrFail: any;
    findBy: any;
    save: any;
    create: any;
    update: any;
    delete: any;
  }
  export const In: any;
  export const PrimaryGeneratedColumn: any;
  export const Column: any;
  export const Entity: any;
  export const CreateDateColumn: any;
  export const UpdateDateColumn: any;
  export const ManyToOne: any;
  export const OneToMany: any;
  export const JoinColumn: any;
  export const Unique: any;
  export const Index: any;
}

declare module 'express' {
  export interface Request {
    [key: string]: any;
  }
}
