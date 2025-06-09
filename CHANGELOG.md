# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
