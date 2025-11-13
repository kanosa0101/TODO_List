# 项目架构文档

## 概述

这是一个前后端分离的全栈待办事项应用，采用现代化的架构设计和最佳实践。

## 技术选型

### 后端
- **语言**: Java 17
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL (关系型数据库)
- **ORM**: Spring Data JPA
- **构建工具**: Maven

### 前端
- **框架**: React 18
- **构建工具**: Vite 5
- **语言**: JavaScript (ES6+)
- **样式**: CSS3

## 后端架构详解

### 分层架构

```
┌─────────────────────────────────────┐
│   Controller Layer (控制器层)       │
│   - 处理 HTTP 请求                   │
│   - 参数验证                         │
│   - 返回响应                         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Service Layer (服务层)             │
│   - 业务逻辑                         │
│   - 事务管理                         │
│   - 数据转换                         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository Layer (数据访问层)      │
│   - JPA Repository 接口              │
│   - 自动实现 CRUD                    │
│   - 自定义查询方法                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database (MySQL 数据库)            │
│   - SQL 存储                         │
│   - 事务支持                         │
│   - 持久化                           │
└─────────────────────────────────────┘
```

### 包结构说明

```
com.todo/
├── TodoApplication.java          # Spring Boot 应用入口
│
├── controller/                   # 控制器层
│   ├── TodoController.java       # 待办事项 REST API
│   ├── NoteController.java       # 笔记 REST API
│   └── AuthController.java       # 认证 REST API
│       - @RestController
│       - 处理 GET/POST/PUT/PATCH/DELETE 请求
│
├── service/                      # 服务层
│   ├── TodoService.java          # 待办事项业务逻辑
│   ├── NoteService.java          # 笔记业务逻辑
│   └── AuthService.java          # 认证业务逻辑
│       - @Service
│       - 依赖注入 Repository
│       - 处理业务规则和数据转换
│
├── repository/                   # 数据访问层
│   ├── TodoRepository.java       # 待办事项 Repository
│   ├── NoteRepository.java       # 笔记 Repository
│   └── UserRepository.java       # 用户 Repository
│       - extends JpaRepository<T, Long>
│       - 自定义查询方法
│
├── model/                        # 数据模型
│   ├── Todo.java                 # 待办事项实体
│   ├── Note.java                 # 笔记实体
│   └── User.java                 # 用户实体
│       - @Entity
│       - 数据库表映射
│
├── dto/                          # 数据传输对象
│   ├── TodoRequest.java          # 待办事项请求 DTO
│   ├── NoteRequest.java          # 笔记请求 DTO
│   ├── LoginRequest.java         # 登录请求 DTO
│   └── RegisterRequest.java      # 注册请求 DTO
│       - 参数验证注解
│       - 数据封装
│
├── security/                     # 安全相关
│   ├── JwtAuthenticationFilter.java  # JWT 认证过滤器
│   └── UserDetailsServiceImpl.java   # 用户详情服务
│
├── util/                         # 工具类
│   ├── JwtUtil.java              # JWT 工具类
│   └── SecurityUtil.java         # 安全工具类
│
└── exception/                    # 异常处理
    ├── TodoNotFoundException.java      # 待办事项未找到异常
    ├── NoteNotFoundException.java       # 笔记未找到异常
    └── GlobalExceptionHandler.java     # 全局异常处理器
        - @RestControllerAdvice
        - 统一异常响应格式
```

### 数据库设计

#### Todo 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 主键 |
| text | VARCHAR(500) | NOT NULL | 待办内容 |
| completed | BOOLEAN | NOT NULL | 完成状态 |
| priority | VARCHAR(20) | NOT NULL | 优先级 (LOW/MEDIUM/HIGH) |
| user_id | BIGINT | FOREIGN KEY | 所属用户ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### Note 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 主键 |
| title | VARCHAR(255) | NOT NULL | 笔记标题 |
| content | TEXT | NOT NULL | 笔记内容（Markdown） |
| user_id | BIGINT | FOREIGN KEY | 所属用户ID |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### User 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（BCrypt加密） |
| email | VARCHAR(100) | NOT NULL, UNIQUE | 邮箱 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

#### JPA 特性

- **自动建表**: `spring.jpa.hibernate.ddl-auto=update`
- **生命周期回调**: `@PrePersist`, `@PreUpdate`
- **自动时间戳**: 创建和更新时自动设置时间

### API 设计

#### RESTful 端点

**认证 API（无需 Token）**

| 方法 | 路径 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | `/api/auth/register` | 用户注册 | `RegisterRequest` | `AuthResponse` |
| POST | `/api/auth/login` | 用户登录 | `LoginRequest` | `AuthResponse` |

**待办事项 API（需要 Token）**

| 方法 | 路径 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/todos` | 获取所有待办 | - | `List<Todo>` |
| GET | `/api/todos?filter=ACTIVE` | 按状态筛选 | - | `List<Todo>` |
| GET | `/api/todos/{id}` | 获取单个待办 | - | `Todo` |
| POST | `/api/todos` | 创建待办 | `TodoRequest` | `Todo` |
| PUT | `/api/todos/{id}` | 完整更新 | `Map` | `Todo` |
| PATCH | `/api/todos/{id}` | 部分更新 | `Map` | `Todo` |
| DELETE | `/api/todos/{id}` | 删除待办 | - | `204 No Content` |

**笔记 API（需要 Token）**

| 方法 | 路径 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/notes` | 获取所有笔记 | - | `List<Note>` |
| GET | `/api/notes/{id}` | 获取单个笔记 | - | `Note` |
| POST | `/api/notes` | 创建笔记 | `NoteRequest` | `Note` |
| PUT | `/api/notes/{id}` | 完整更新 | `NoteRequest` | `Note` |
| PATCH | `/api/notes/{id}` | 部分更新 | `Map` | `Note` |
| DELETE | `/api/notes/{id}` | 删除笔记 | - | `204 No Content` |

#### 状态码

- `200 OK`: 成功
- `201 Created`: 创建成功
- `204 No Content`: 删除成功
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器错误

## 前端架构详解

### 组件树

```
App.jsx (根组件)
├── State Management (状态管理)
│   ├── todos: Todo[]
│   ├── filter: string
│   ├── loading: boolean
│   └── error: string
│
├── TodoStats (统计组件)
│   └── Props: { todos }
│
├── TodoForm (表单组件)
│   └── Props: { onSubmit }
│
├── TodoFilter (筛选组件)
│   └── Props: { filter, onFilterChange, todos }
│
└── TodoList (列表组件)
    └── Props: { todos, onToggle, onUpdate, onDelete, onPriorityChange }
        └── TodoItem[] (列表项组件)
            └── Props: { todo, onToggle, onUpdate, onDelete, onPriorityChange }
```

### 目录结构说明

```
src/
├── main.jsx                      # React 应用入口
│   - ReactDOM.createRoot()
│   - 挂载到 #root
│
├── App.jsx                       # 主应用组件
│   - 状态管理
│   - 业务逻辑协调
│   - 组件组合
│
├── components/                   # UI 组件
│   ├── TodoStats.jsx            # 统计信息展示
│   ├── TodoForm.jsx             # 表单输入
│   ├── TodoFilter.jsx           # 筛选控制
│   ├── TodoList.jsx             # 列表容器
│   └── TodoItem.jsx             # 单个待办项
│
├── services/                     # API 服务层
│   └── todoService.js           # 封装所有 API 调用
│       - getAllTodos()
│       - createTodo()
│       - updateTodo()
│       - deleteTodo()
│
├── utils/                        # 工具函数
│   ├── constants.js             # 常量定义
│   │   - PRIORITY
│   │   - FILTER
│   │   - PRIORITY_LABELS
│   │   - PRIORITY_COLORS
│   └── dateUtils.js             # 日期工具
│       - formatDate()
│
└── styles/                       # 样式文件
    ├── index.css                # 全局样式
    ├── App.css                  # 应用样式
    └── components.css           # 组件样式
```

### 数据流

```
用户操作
    ↓
组件事件处理 (handleAdd, handleToggle, etc.)
    ↓
todoService API 调用
    ↓
HTTP Request (fetch)
    ↓
后端 API
    ↓
HTTP Response
    ↓
更新状态 (setState)
    ↓
React 重新渲染
    ↓
UI 更新
```

## 通信机制

### 前后端通信

```
Frontend (localhost:3000)
    ↓ HTTP/JSON
Backend (localhost:3001)
    ↓ JDBC
MySQL Database (localhost:3306/tododb)
```

### CORS 配置

后端配置了 CORS，允许前端跨域访问：
```properties
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET,POST,PUT,PATCH,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

### Vite 代理

开发环境下，Vite 配置了代理：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

## 数据持久化

### MySQL 数据库

- **类型**: 关系型 SQL 数据库
- **连接**: `localhost:3306/tododb`
- **模式**: 独立数据库服务
- **特点**: 
  - 生产级数据库，性能优秀
  - 支持标准 SQL
  - 支持事务、索引、外键等高级特性
  - 适合生产环境使用

### 数据库配置

配置文件位置：`backend/src/main/resources/application.properties`

```properties
# MySQL 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/tododb?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8&useUnicode=true&allowPublicKeyRetrieval=true
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

### 数据库初始化

1. **创建数据库**：
   ```sql
   CREATE DATABASE tododb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **自动建表**：
   - 首次启动时，JPA 会根据实体类自动创建表结构
   - `spring.jpa.hibernate.ddl-auto=update` 会自动更新表结构

### JPA 配置

```properties
spring.jpa.hibernate.ddl-auto=update  # 自动更新表结构
spring.jpa.show-sql=true              # 显示 SQL 语句
spring.jpa.properties.hibernate.format_sql=true  # 格式化 SQL
```

## 设计模式

### 后端

1. **依赖注入 (DI)**: 通过构造函数注入依赖
2. **仓储模式 (Repository)**: 抽象数据访问
3. **DTO 模式**: 分离内部模型和外部接口
4. **异常处理**: 统一异常处理机制

### 前端

1. **组件化**: 单一职责原则
2. **服务层模式**: 封装 API 调用
3. **Hooks**: 使用 React Hooks 管理状态
4. **受控组件**: 表单状态由 React 管理

## 启动脚本

项目提供了多个启动脚本，简化开发流程：

### 一键启动脚本

**`start-all.bat` / `start-all.sh`** - 一键启动所有服务
- 自动检查必要工具（Java、Maven、Node.js、npm）
- 自动检测并启动 MySQL 服务
- 自动检查/安装前端依赖
- 在新窗口中启动后端和前端服务器
- **自动打开浏览器访问前端页面**

### 单独启动脚本

- **`start-backend.bat` / `start-backend.sh`** - 仅启动后端
  - 自动检测 MySQL 服务状态
  - 如果 MySQL 未运行，自动启动（需要管理员权限）
  
- **`start-frontend.bat` / `start-frontend.sh`** - 仅启动前端
  - 自动打开浏览器访问前端页面

### 使用建议

1. **首次使用**：使用一键启动脚本 `start-all.bat`，自动处理所有准备工作
2. **日常开发**：如果 MySQL 已启动，可以直接运行 `start-all.bat`（无需管理员权限）
3. **单独调试**：使用对应的单独启动脚本，便于调试特定服务

## 扩展性

### 切换数据库

项目已从 H2 迁移到 MySQL，如需切换到其他数据库：

1. 修改 `pom.xml`，添加数据库驱动依赖
2. 修改 `application.properties`，更新数据源配置
3. Repository 接口无需修改（JPA 抽象层）

### 添加新功能

1. **后端**: 在 Service 添加方法 → Controller 添加端点
2. **前端**: 创建新组件 → 在 App.jsx 中组合

## 最佳实践

### 代码组织
1. **分层架构**: 按功能/层次划分（Controller-Service-Repository）
2. **命名规范**: 统一的命名约定（PascalCase、camelCase）
3. **关注点分离**: 前后端职责明确，API 接口清晰

### 开发实践
1. **错误处理**: 统一的异常处理机制（GlobalExceptionHandler）
2. **数据验证**: 使用 Spring Validation 进行参数验证
3. **可测试性**: 依赖注入便于单元测试
4. **日志记录**: 使用 Spring Boot 默认日志配置

### 部署实践
1. **环境配置**: 使用 `application.properties` 管理配置
2. **数据库迁移**: 使用 JPA 自动建表，生产环境建议使用 Flyway/Liquibase
3. **启动脚本**: 使用提供的启动脚本简化部署流程

## 性能考虑

1. **数据库索引**: 可在 Todo 实体添加 `@Index`
2. **分页查询**: 可使用 JPA 的 `Pageable`
3. **缓存**: 可添加 Spring Cache
4. **前端优化**: React.memo, useMemo, useCallback

## 安全性

当前版本为学习项目，生产环境需要：

1. **用户认证**: 添加 Spring Security 进行身份验证
2. **API 权限控制**: 基于角色的访问控制（RBAC）
3. **SQL 注入防护**: JPA 已提供参数化查询保护
4. **XSS 防护**: 前端输入验证和输出转义
5. **HTTPS 支持**: 使用 SSL/TLS 加密传输
6. **密码加密**: 数据库密码使用环境变量或配置中心管理
7. **CORS 配置**: 生产环境限制允许的源

## 开发工具

### 推荐工具

- **IDE**: IntelliJ IDEA / VS Code
- **数据库管理**: MySQL Workbench / DBeaver
- **API 测试**: Postman / curl
- **版本控制**: Git

### 调试技巧

1. **后端调试**: 
   - 查看 Spring Boot 启动日志
   - 使用 `spring.jpa.show-sql=true` 查看 SQL 语句
   - 使用 IDE 断点调试

2. **前端调试**:
   - 使用浏览器开发者工具
   - 查看 Network 标签页的 API 请求
   - 使用 React DevTools 调试组件状态

3. **数据库调试**:
   - 使用 MySQL Workbench 查看数据
   - 查看后端日志中的 SQL 语句
   - 使用 `SHOW TABLES` 和 `DESCRIBE table_name` 检查表结构

