import Geolocation from '@react-native-community/geolocation';
import {Coordinate} from '../types/coordinate';
import {Platform} from 'react-native';
import {isLocationEnabled} from 'react-native-android-location-enabler';

const fetchIpAndLocation = async () => {
  try {
    // Get the device's IP address
    const ipResponse = await fetch(`https://api.ip.pe.kr/json/`);
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // Fetch location data based on the IP address
    const locResponse = await fetch(`https://ipinfo.io/${ip}/json`);
    const locData = await locResponse.json();

    return {
      latitude: parseFloat(locData.loc.split(',')[0]),
      longitude: parseFloat(locData.loc.split(',')[1]),
    };
  } catch (error) {
    console.error('Error fetching IP address or location:', error);
    return false;
  }
};

export const getCurPosition = async (
  initial?: boolean,
): Promise<Coordinate> => {
  if (Platform.OS === 'android') {
    const checkEnabled: boolean = await isLocationEnabled();
    console.log('checkEnabled', checkEnabled);
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      info =>
        resolve({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        }),
      async error => {
        // console.error(error);
        if (!initial) {
          const locationByIp = await fetchIpAndLocation();
          if (locationByIp) resolve(locationByIp);
          else reject(error);
        }
        reject(error);
      },
      /* PositionError 객체를 input param으로 받는 콜백 : 
        code: 에러의 종류를 나타내는 숫자입니다. 1은 권한 거부, 2는 위치를 사용할 수 없음, 3은 시간 초과을 나타냅니다.
        message: 에러에 대한 설명을 나타내는 문자열입니다.
        PERMISSION_DENIED: 사용자가 위치 정보 접근을 거부한 경우의 에러 코드입니다.
        POSITION_UNAVAILABLE: 위치 정보를 사용할 수 없는 경우의 에러 코드입니다.
        TIMEOUT: 위치 정보를 가져오는 데 시간이 초과된 경우의 에러 코드입니다. */
      {enableHighAccuracy: true, timeout: 1200, maximumAge: 2000},
    );
  });
};
