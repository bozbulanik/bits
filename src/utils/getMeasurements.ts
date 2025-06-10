export const measurementMass = [
  { name: 'Kilogram', abbr: 'kg' },
  { name: 'Gram', abbr: 'g' },
  { name: 'Pound', abbr: 'lb' },
  { name: 'Ounce', abbr: 'oz' }
]

export const measurementLength = [
  { name: 'Meter', abbr: 'm' },
  { name: 'Centimeter', abbr: 'cm' },
  { name: 'Millimeter', abbr: 'mm' },
  { name: 'Kilometer', abbr: 'km' },
  { name: 'Inch', abbr: 'in' },
  { name: 'Foot', abbr: 'ft' },
  { name: 'Yard', abbr: 'yd' }
]
export const measurementVolume = [
  { name: 'Liter', abbr: 'L' },
  { name: 'Milliliter', abbr: 'mL' },
  { name: 'Cubic Meter', abbr: 'm³' },
  { name: 'Gallon', abbr: 'gal' }
]
export const measurementTemperature = [
  { name: 'Celsius', abbr: '°C' },
  { name: 'Fahrenheit', abbr: '°F' },
  { name: 'Kelvin', abbr: 'K' }
]
export const measurementEnergy = [
  { name: 'Joule', abbr: 'J' },
  { name: 'Calorie', abbr: 'cal' },
  { name: 'Kilowatt-hour', abbr: 'kWh' },
  { name: 'Watt', abbr: 'W' }
]
export const measurementSpeed = [
  { name: 'Meter per second', abbr: 'm/s' },
  { name: 'Kilometer per hour', abbr: 'km/h' },
  { name: 'Mile per hour', abbr: 'mph' }
]
export const measurementFrequency = [
  { name: 'Hertz', abbr: 'Hz' },
  { name: 'Kilohertz', abbr: 'kHz' },
  { name: 'Megahertz', abbr: 'MHz' }
]
export const measurementArea = [
  { name: 'Square meter', abbr: 'm²' },
  { name: 'Square kilometer', abbr: 'km²' },
  { name: 'Square foot', abbr: 'ft²' },
  { name: 'Acre', abbr: 'ac' }
]

export const measurementOptions = [
  {
    header: 'Mass',
    options: measurementMass.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Length',
    options: measurementLength.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Volume',
    options: measurementVolume.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Temperature',
    options: measurementTemperature.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Energy',
    options: measurementEnergy.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Speed',
    options: measurementSpeed.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Frequency',
    options: measurementFrequency.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  },
  {
    header: 'Area',
    options: measurementArea.map((opt) => ({
      value: opt.abbr,
      label: opt.name + ` (${opt.abbr})`
    })),
    divider: true
  }
]
