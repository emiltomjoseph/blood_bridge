export class DistanceService {
  private static EARTH_RADIUS_KM = 6371;

  /**
   * Calculates straight-line distance in kilometers between two geographic coordinates
   * using the Haversine formula.
   */
  static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
      throw new Error('INVALID_LATITUDE_RANGE');
    }
    if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
      throw new Error('INVALID_LONGITUDE_RANGE');
    }

    // Convert degrees to radians
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const radLat1 = this.toRadians(lat1);
    const radLat2 = this.toRadians(lat2);

    // Haversine formula
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_KM * c;

    // Round to 2 decimal places
    return Math.round(distance * 100) / 100;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
