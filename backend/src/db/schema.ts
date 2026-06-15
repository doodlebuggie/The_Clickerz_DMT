import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  displayName:  text('display_name').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatar:       text('avatar'),              // base64 data URL
  walletAddress: text('wallet_address'),     // set after signup
  createdAt:    integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const transactions = sqliteTable('transactions', {
  id:                    text('id').primaryKey(),         // crypto.randomUUID()

  // PENDING → AWAITING_GRANT → COMPLETED | FAILED
  status:                text('status').notNull(),

  // FIXED_SEND: sender specifies debitAmount
  // FIXED_RECEIVE: receiver specifies incomingAmount
  paymentType:           text('payment_type').notNull(),

  // Canonical https:// wallet address URLs
  senderWalletAddress:   text('sender_wallet_address').notNull(),
  receiverWalletAddress: text('receiver_wallet_address').notNull(),

  // Amounts in smallest asset unit (e.g. cents for USD); strings to avoid float drift
  debitAmount:           text('debit_amount'),            // what the sender pays
  receiveAmount:         text('receive_amount'),          // what the receiver gets
  assetCode:             text('asset_code').notNull(),    // sender's currency, e.g. USD
  assetScale:            integer('asset_scale').notNull(),// sender's scale, e.g. 2 (cents)
  receiveAssetCode:      text('receive_asset_code'),      // receiver's currency (may differ)
  receiveAssetScale:     integer('receive_asset_scale'),  // receiver's scale

  // Open Payments resource URLs — full canonical URLs returned by the SDK
  incomingPaymentUrl:    text('incoming_payment_url'),
  quoteUrl:              text('quote_url'),
  outgoingPaymentUrl:    text('outgoing_payment_url'),

  // GNAP grant continuation — persisted so the /api/callback handler can resume
  grantContinueUri:      text('grant_continue_uri'),
  grantContinueToken:    text('grant_continue_token'),
  grantInteractNonce:    text('grant_interact_nonce'),

  userId:                text('user_id').references(() => users.id),

  errorMessage:          text('error_message'),
  createdAt:             integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:             integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type Transaction      = typeof transactions.$inferSelect;
export type NewTransaction   = typeof transactions.$inferInsert;

// A payment request ("ask"): the requester asks the payer to send them money.
// Pure DB record — no Open Payments resources exist until the payer fulfils it
// (quotes and incoming payments expire; an ask can sit for days).
export const paymentRequests = sqliteTable('payment_requests', {
  id:            text('id').primaryKey(),               // crypto.randomUUID()

  requesterId:   text('requester_id').notNull().references(() => users.id), // who gets paid
  payerId:       text('payer_id').notNull().references(() => users.id),     // who is asked to pay

  // FIXED_SEND:    payer sends exactly `amount` (denominated in the payer's currency)
  // FIXED_RECEIVE: requester receives exactly `amount` (denominated in the requester's currency)
  paymentType:   text('payment_type').notNull(),

  amount:        text('amount').notNull(),               // smallest asset unit, string
  assetCode:     text('asset_code').notNull(),           // currency the amount is denominated in
  assetScale:    integer('asset_scale').notNull(),

  note:          text('note'),                           // optional message to the payer

  // PENDING → COMPLETED | DECLINED | CANCELLED.
  // A failed payment leaves the ask PENDING so the payer can retry.
  status:        text('status').notNull(),

  // Set when the payer starts fulfilment; the /api/callback handler marks the
  // ask COMPLETED when this transaction's outgoing payment succeeds.
  transactionId: text('transaction_id').references(() => transactions.id),

  createdAt:     integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type PaymentRequest    = typeof paymentRequests.$inferSelect;
export type NewPaymentRequest = typeof paymentRequests.$inferInsert;
