export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    const data = await res.json()
    return data.display_name
  } catch (err) {
    console.error('Reverse geocoding failed:', err)
    return null
  }
}
