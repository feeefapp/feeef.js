# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `ff.orders.quoteShipping({ storeId, items, shippingState, shippingCity?, shippingType? })`
  returns `{ shippingPrice: number | null }`, the fee `POST /orders/calculate`
  will charge (Cloud Parcel fees included). `calculate` now forwards
  `shippingCity` (commune) too. New types `ShippingQuoteOptions`, `ShippingQuote`.
- Public Meta, TikTok and Snap pixel entries (`generatePublicStoreIntegrations`)
  now carry `capi: boolean`: whether the pixel has a Conversions API key /
  access token (the value itself is never exposed). The storefront uses it to
  send Purchase/Lead from the browser only for platforms the server cannot
  cover (mode `client`, or a pixel without a key). New type
  `PublicPixelEntry`. Additive; the backend must depend on this version to
  emit the flag (and its own Snap override in `Store.publicIntegrations` must
  add it too).

## [0.13.0] - 2026-10-09

### BREAKING CHANGES

- **Public store security config** (`generatePublicStoreIntegrationSecurity`, the `security` block in the public store payload) is now numeric knobs only:

  ```ts
  { minTimeMs: number; duplicateWindowMs: number; submitCooldownMs: number } | null
  ```

  Values are milliseconds (0 = off); `null` when security is off. Rule names and outcomes are no longer published.
- **Removed exports**:
  - order helpers `isFakeOrderId`, `isFakeOrder`, `isWarningOrder` and `shouldSuppressPixelEvents`;
  - the old public option types `PublicSecurityOption`, `PublicSecurityOptions` and `PublicSecurityMinTimeOption`.

#### Migration

- Read `minTimeMs`, `duplicateWindowMs` and `submitCooldownMs` from the public security config instead of the old per-rule options, and handle `null`.
- Drop calls to the removed order helpers. Submit orders through the storefront (`submitFeeefOrder`) and decide on browser order events from your own submit result; nothing in an order's `id` or body classifies it.

### Added

- **Delivery**: exported canonical `ParcelCreate` / `ParcelUpdate` / related types (`src/delivery/parcel.ts`) and `DeliveryCarrierClient` (`src/delivery/delivery_carrier_client.ts`), aligned with the Feeef API parcel domain.

### Changed

- **Delivery / `ParcelCreate`** (breaking): rename — `codAmount` → `total`, `productsSummary` → `summary`, `parcelType` → `type`; added `pickupId`, `freeShipping`; `shippingType` typed as platform `ShippingType`. HTTP bridge still accepts legacy keys (`codAmount`, `productsSummary`, `parcelType`, `centerId`) server-side via `normalizeLegacyParcelCreatePatch`.

## [0.12.12] - 2026-08-14

### Added

- **Orders**: `OrderStatus.followup` (`'followup'`). Use after `accepted` when the order is confirmed but still needs action before `processing` or `completed`. Existing statuses are unchanged.

## [0.8.7] - 2025-03-21

### Added

- **Realtime (AdonisJS Transmit)**: `createFeeefTransmit`, `createFeeefTransmitFromAxios`, `transmitRootFromApiBaseUrl`, `FeeefTransmitHttpClient`, re-exports `Transmit` / `Subscription` from `@adonisjs/transmit-client`, and `RealtimeCrudEvent<T>` for typed payloads.
- Subscribe/unsubscribe POST requests include `Authorization` at request construction (fixes unreliable `beforeSubscribe` header mutation on frozen `Request` objects).

## [0.6.1] - 2025-12-36

- Bug fixes and performance improvements.

## [0.6.0] - 2025-12-26

- Initial release of version 0.6.0.
- Add deposits/transfers repositories.
- fix bugs.
- improve typesafety.

## [0.5.6] - 2024-03-08

### Fixed

- Fixed cart addon price calculation in `CartService.getItemTotal`
- Added test coverage for cart addon price calculations

## [0.5.1] - 2025-02-14

### Added

- Added `getShippingPriceForType` method to `CartService`

## [0.4.15] - 2024-03-21

### Added

- Enhanced `ProductOffer` interface with quantity constraints:
  - Added `minQuantity` field to specify minimum required quantity
  - Added `maxQuantity` field to specify maximum allowed quantity
- New quantity management in `CartService`:
  - Automatic quantity adjustment when applying offers with constraints
  - Smart clamping of quantities to stay within offer limits

### Changed

- Modified offer handling in cart to respect quantity constraints
- Updated `updateItemOffer` and `updateCurrentItemOffer` to handle quantity limits
- Improved error handling for offer applications

### Documentation

- Added comprehensive documentation for ProductOffer features
- Updated README with new offer constraint examples
- Added best practices for handling offer constraints

## [0.4.14] - Previous version

Initial tracked version.
