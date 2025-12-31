# Geo Repositories Implementation - feeefjs

## Overview

This document describes the implementation of Countries, States, and Cities repositories in feeefjs, matching the Dart implementation.

## Implementation Status

### ✅ Entity Models Created

1. **CountryEntity** (`src/core/entities/country.ts`)

   - `code`: ISO 3166-1 alpha-2 country code (e.g., US, DZ, SA)
   - `name`: Country name
   - `phone`: Phone country code without +
   - `metadata`: Additional metadata
   - `createdAt`: Creation timestamp

2. **StateEntity** (`src/core/entities/state.ts`)

   - `countryCode`: Country code (part of composite key)
   - `code`: State/province code (part of composite key)
   - `name`: State/province name
   - `metadata`: Additional metadata
   - `createdAt`: Creation timestamp

3. **CityEntity** (`src/core/entities/city.ts`)
   - `countryCode`: Country code (part of composite key)
   - `stateCode`: State code (part of composite key)
   - `name`: City name (part of composite key)
   - `metadata`: Additional metadata
   - `createdAt`: Creation timestamp

### ✅ Repositories Created

1. **CountryRepository** (`src/feeef/repositories/countries.ts`)

   - Standard CRUD operations
   - `findByCode(code)`: Find country by ISO code

2. **StateRepository** (`src/feeef/repositories/states.ts`)

   - Standard CRUD operations
   - `list(options?)`: List states with optional countryCode filter
   - `listByCountry(countryCode, options?)`: List states for a country (nested route)
   - `findByCode(countryCode, stateCode, params?)`: Find state by composite key
   - `createByCountry(countryCode, data, params?)`: Create state (nested)
   - `updateByCountry(countryCode, stateCode, data, params?)`: Update state (nested)
   - `deleteByCountry(countryCode, stateCode, params?)`: Delete state (nested)

3. **CityRepository** (`src/feeef/repositories/cities.ts`)
   - Standard CRUD operations
   - `list(options?)`: List cities with optional countryCode/stateCode filters
   - `listByState(countryCode, stateCode, options?)`: List cities for a state (nested route)
   - `findByName(countryCode, stateCode, cityName, params?)`: Find city by composite key
   - `createByState(countryCode, stateCode, data, params?)`: Create city (nested)
   - `updateByState(countryCode, stateCode, cityName, data, params?)`: Update city (nested)
   - `deleteByState(countryCode, stateCode, cityName, params?)`: Delete city (nested)
   - `search(query, options?)`: Search cities by name (autocomplete)

### ✅ Integration

- Added to `FeeeF` class:

  - `feeef.countries`: CountryRepository
  - `feeef.states`: StateRepository
  - `feeef.cities`: CityRepository

- Exported from `index.ts`:
  - `CountryEntity`
  - `StateEntity`
  - `CityEntity`
  - `CountryRepository`
  - `StateRepository`
  - `CityRepository`

## API Routes Supported

### Countries

- `GET /countries` - List countries
- `GET /countries/:code` - Get country by code
- `POST /countries` - Create country
- `PUT /countries/:code` - Update country
- `DELETE /countries/:code` - Delete country

### States

- `GET /states` - List states (with optional countryCode filter)
- `GET /countries/:country_code/states` - List states for a country
- `GET /countries/:country_code/states/:id` - Get state by composite key
- `POST /countries/:country_code/states` - Create state
- `PUT /countries/:country_code/states/:id` - Update state
- `DELETE /countries/:country_code/states/:id` - Delete state

### Cities

- `GET /cities` - List cities (with optional countryCode/stateCode filters)
- `GET /countries/:country_code/states/:state_code/cities` - List cities for a state
- `GET /countries/:country_code/states/:state_code/cities/:id` - Get city by composite key
- `POST /countries/:country_code/states/:state_code/cities` - Create city
- `PUT /countries/:country_code/states/:state_code/cities/:id` - Update city
- `DELETE /countries/:country_code/states/:state_code/cities/:id` - Delete city
- `GET /cities/search?q=...` - Search cities (autocomplete)

## Usage Examples

```typescript
import { FeeeF } from 'feeef'

const feeef = new FeeeF({ apiKey: 'your-api-key' })

// Countries
const countries = await feeef.countries.list()
const algeria = await feeef.countries.findByCode('DZ')

// States
const states = await feeef.states.list({ countryCode: 'DZ' })
const statesForDZ = await feeef.states.listByCountry('DZ')
const state = await feeef.states.findByCode('DZ', '16')

// Cities
const cities = await feeef.cities.list({ countryCode: 'DZ', stateCode: '16' })
const citiesForState = await feeef.cities.listByState('DZ', '16')
const city = await feeef.cities.findByName('DZ', '16', 'Algiers')
const searchResults = await feeef.cities.search('Alg', { countryCode: 'DZ' })
```

## Status

✅ **Complete**: All repositories implemented and tested
✅ **Build**: Successfully compiled
✅ **Tests**: All existing tests passing
✅ **Exports**: Properly exported and available
