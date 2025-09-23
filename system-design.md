# Unipos システム設計図

## 1. データベーススキーマ（ER図）

```mermaid
erDiagram
    user {
        uuid id PK
        text discord_id UK
        text discord_user_name
        text discord_avatar
        timestamp created_at
    }

    discord_tokens {
        uuid user_id PK,FK
        text access_token
        text refresh_token
        timestamp expires_at
        text scope
        text token_type
        timestamp created_at
    }

    oauth_state {
        text session_id PK
        text state UK
        text nonce
        text code_verifier
        timestamp expires_at
        timestamp created_at
    }

    appreciations {
        uuid id PK
        uuid sender_id FK
        text message
        integer point_per_receiver
        timestamp created_at
    }

    appreciation_receivers {
        uuid id PK
        uuid appreciation_id FK
        uuid receiver_id FK
        timestamp created_at
    }

    consumed_point_log {
        uuid id PK
        uuid user_id FK
        uuid appreciation_id FK
        date week_start_date
        integer consumed_points
        timestamp created_at
    }

    %% Relationships
    user ||--o{ discord_tokens : "has"
    user ||--o{ appreciations : "sends"
    user ||--o{ appreciation_receivers : "receives"
    user ||--o{ consumed_point_log : "consumes_points"
    
    appreciations ||--o{ appreciation_receivers : "has_receivers"
    appreciations ||--o{ consumed_point_log : "generates_consumption"
    
    appreciation_receivers }o--|| appreciations : "belongs_to"
    appreciation_receivers }o--|| user : "received_by"
    
    consumed_point_log }o--|| user : "belongs_to"
    consumed_point_log }o--|| appreciations : "from_appreciation"
```

## 2. アーキテクチャ構成（レイヤー図）

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[Controllers] --> B[Routes]
    end

    subgraph "Application Layer"
        C[Use Cases] --> D[Services]
    end

    subgraph "Domain Layer"
        E[Entities] --> F[Value Objects]
        G[Domain Services] --> E
    end

    subgraph "Infrastructure Layer"
        H[Repositories] --> I[Database Client]
        J[External APIs] --> K[Discord API]
    end

    A --> C
    C --> E
    C --> H
    H --> I

    %% 具体的なファイル構成
    subgraph "実装ファイル"
        L[auth.ts - Controller]
        M[DiscordAuthCallbackUseCase.ts]
        N[Appreciation.ts - Entity]
        O[AppreciationRepository.ts]
    end
```

## 3. 感謝投稿のデータフロー

```mermaid
sequenceDiagram
    participant U as User
    participant C as Controller
    participant UC as CreateAppreciationUseCase
    participant A as Appreciation Entity
    participant AR as AppreciationRepository
    participant CR as ConsumedPointLogRepository
    participant DB as Database

    U->>C: POST /appreciation (sender, receivers, message, points)
    C->>UC: createAppreciation()
    
    UC->>A: Appreciation.create()
    A->>A: validateWeeklyLimit(consumed, new)
    A-->>UC: Result<Appreciation, Error>
    
    alt Success
        UC->>AR: store(appreciation)
        AR->>DB: INSERT appreciations
        AR->>DB: INSERT appreciation_receivers
        
        UC->>CR: store(consumedPointLog)
        CR->>DB: INSERT consumed_point_log
        
        UC-->>C: Success Response
        C-->>U: 201 Created
    else Validation Error
        UC-->>C: Error Response
        C-->>U: 400 Bad Request
    end
```

## 4. 週次ポイント制限チェックのフロー

```mermaid
flowchart TD
    A[感謝投稿要求] --> B[Appreciation.create()]
    B --> C[総消費ポイント計算]
    C --> D[既存消費ポイント取得]
    D --> E{週次制限チェック}
    
    E -->|制限内| F[感謝作成成功]
    E -->|制限超過| G[WeeklyPointLimitExceededError]
    
    F --> H[データベース保存]
    H --> I[感謝テーブル]
    H --> J[受信者テーブル]
    H --> K[消費ポイントログ]
    
    G --> L[エラーレスポンス]

    subgraph "週次制限ロジック"
        M[alreadyConsumed + newConsumption > 400?]
        N[制限値: 400ポイント/週]
        O[週開始日: 月曜日00:00]
    end
```

## 5. ドメインオブジェクトの関係

```mermaid
classDiagram
    class Appreciation {
        -appreciationID: AppreciationID
        -senderID: UserID
        -receiverIDs: ReceiverIDs
        -message: AppreciationMessage
        -pointPerReceiver: PointPerReceiver
        -createdAt: CreatedAt
        +create() Appreciation
        +getTotalConsumedPoints() NewTotalConsumptionPoints
        +validateWeeklyLimit() Result
    }

    class ConsumedPointLog {
        -consumedPointLogID: ConsumedPointLogID
        -userID: UserID
        -appreciationID: AppreciationID
        -weekStartDate: WeekStartDate
        -consumedPoints: ConsumedPoints
        -createdAt: CreatedAt
        +create() ConsumedPointLog
    }

    class User {
        -userID: UserID
        -discordID: DiscordID
        -userName: UserName
        -avatar: Avatar
        -createdAt: CreatedAt
    }

    class WeekStartDate {
        -value: Date
        +from(Date) WeekStartDate
        +new() WeekStartDate
        +fromString(string) WeekStartDate
    }

    Appreciation --> ConsumedPointLog : "generates"
    Appreciation --> User : "sender/receivers"
    ConsumedPointLog --> User : "belongs to"
    ConsumedPointLog --> WeekStartDate : "uses"
```

## 6. 値オブジェクトの制約

```mermaid
graph LR
    subgraph "感謝関連の制約"
        A[PointPerReceiver: 1-120]
        B[AppreciationMessage: 1-200文字]
        C[ReceiverIDs: 1-6人, 重複なし]
        D[総ポイント: ≤120/投稿]
    end

    subgraph "週次制限"
        E[WeeklyLimit: 400ポイント/週]
        F[WeekStartDate: 月曜日00:00]
    end

    subgraph "消費ポイントログ"
        G[ConsumedPoints: 1-120]
        H[週単位での集計]
    end

    A --> D
    C --> D
    D --> E
    F --> H
    G --> H
```

## 7. データ変換の流れ

```mermaid
flowchart LR
    subgraph "Domain Layer"
        A[WeekStartDate.value: Date]
    end

    subgraph "Infrastructure Layer"
        B[.toISOString().split('T')[0]]
        C[Database: YYYY-MM-DD]
    end

    subgraph "Reconstruction"
        D[new Date(weekStartDate)]
        E[WeekStartDate.from()]
    end

    A -->|保存時| B
    B --> C
    C -->|取得時| D
    D --> E
    E --> A
```

この設計図は以下の特徴を持っています：

1. **明確な責務分離**: レイヤードアーキテクチャによる関心の分離
2. **ドメイン駆動**: ビジネスロジックがドメイン層に集約
3. **データ整合性**: データベース制約とドメインルールの両方で保証
4. **週次制限管理**: ポイント消費の追跡と制限チェック
5. **型安全**: TypeScriptによる静的型チェック

設計相談時にこの図を提示することで、システムの全体像と課題を明確に伝えることができます。
