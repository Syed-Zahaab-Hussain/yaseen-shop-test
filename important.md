between a5 a4 page of receipt
make ledger work without sale and purchase
remove sale price in add purhcase page
add labels in the form input fields
in purchase add invoice, taxes, gst and many more

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model User {
id Int @id @default(autoincrement())
username String @unique
email String @unique
password String

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Product {
id Int @id @default(autoincrement())
name String
categoryId Int?
category Category? @relation(fields: [categoryId], references: [id])
model String
ampereHours Float?
brand String
saleItems SaleItem[]
purchaseItems PurchaseItem[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
}

model Category {
id Int @id @default(autoincrement())
name String @unique

products Product[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
}

model Entity {
id Int @id @default(autoincrement())
name String
type EntityType
customerType CustomerType?
contact String?
email String?
address String?
sales Sale[]
purchases Purchase[]
ledger LedgerEntry[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
}

enum EntityType {
CUSTOMER
SUPPLIER
}

enum CustomerType {
INDIVIDUAL
SHOPOWNER
}

model Sale {
id Int @id @default(autoincrement())
entityId Int?
customer Entity? @relation(fields: [entityId], references: [id])
totalAmount Float
paymentMethod PaymentMethod
receivedAmount Float
receiptNumber String? @unique
saleItems SaleItem[]
discount Float @default(0)
proofOfPayment String?
debtRepaymentDate DateTime?

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
}

enum PaymentMethod {
CASH
BANK_TRANSFER
CREDIT_CARD
DIGITAL_WALLET
}

model SaleItem {
id Int @id @default(autoincrement())
saleId Int
sale Sale @relation(fields: [saleId], references: [id], onDelete: Cascade)
productId Int
product Product @relation(fields: [productId], references: [id])
quantity Int
salePrice Float
totalPrice Float
purchaseItemId Int
purchaseItem PurchaseItem @relation(fields: [purchaseItemId], references: [id])
warranty Warranty?

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
}

model Purchase {
id Int @id @default(autoincrement())
entityId Int?
supplier Entity? @relation(fields: [entityId], references: [id])
totalAmount Float
paymentMethod PaymentMethod
paidAmount Float
purchaseItems PurchaseItem[]
proofOfPurchase String? // URL or path to the image

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
}

model PurchaseItem {
id Int @id @default(autoincrement())
purchaseId Int
productId Int
quantity Int
unitPrice Float
saleItem SaleItem[]
warranty Warranty?

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
product Product @relation(fields: [productId], references: [id])
}

model Warranty {
id Int @id @default(autoincrement())
saleItemId Int? @unique
purchaseItemId Int? @unique
status WarrantyStatus @default(ACTIVE)
retailerWarrantyDuration Float
customerWarrantyDuration Float

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
claims Claim[]
saleItem SaleItem? @relation(fields: [saleItemId], references: [id])
purchaseItem PurchaseItem? @relation(fields: [purchaseItemId], references: [id])
}

model Claim {
id Int @id @default(autoincrement())
warrantyId Int
claimType ClaimType
claimStatus ClaimStatus
claimDate DateTime
claimQuantity Int
claimDetails String
claimResolveDate DateTime?
claimResolveDetail String?
claimRejectDate DateTime?
claimRejectDetail String?
createdAt DateTime @default(now())
updatedAt DateTime @default(now())
deletedAt DateTime?
warranty Warranty @relation(fields: [warrantyId], references: [id], onDelete: Cascade)
}

enum WarrantyStatus {
ACTIVE
EXPIRED
}

enum ClaimType {
CUSTOMER
SUPPLIER
}

enum ClaimStatus {
PENDING
RESOLVED
REJECTED
}

model LedgerEntry {
id Int @id @default(autoincrement())
entityId Int
description String
totalAmount Float @default(0)
receivedAmount Float @default(0)
remainingAmount Float @default(0)
overpaidAmount Float @default(0)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
entity Entity @relation(fields: [entityId], references: [id])
}
