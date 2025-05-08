// Mock data for tunnels
export const mockTunnels = [
  {
    id: 'TUN001',
    name: 'Al Fateh Tunnel',
    riskLevel: 'High',
    waterLevel: 78,
    barrierStatus: 'Closed',
    lastUpdate: new Date('2024-06-10T14:20:37'),
    guidanceDisplayEnabled: true,
    activeGuidanceSymbol: 'detour_right',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.3801309415016!2d50.59217747835604!3d26.216835417942224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a9005b8d76af%3A0x7759a9d2ed1b5b49!2sAl%20Fateh%20Tunnel!5e0!3m2!1sen!2sbh!4v1746620278384!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 28,
      humidity: 72,
      entrance: 65,
      center: 85,
      exit: 55,
      waterLevel: 3,
      airQuality: 65,
      rainfall: 12.5,
      rainfallDuration: "02:30:15",
      rainfallIntensity: 18.2
    }
  },
  {
    id: 'TUN002',
    name: 'Diplomatic Area Tunnel',
    riskLevel: 'Moderate',
    waterLevel: 45,
    barrierStatus: 'Open',
    lastUpdate: new Date('2024-06-10T14:18:12'),
    guidanceDisplayEnabled: false,
    activeGuidanceSymbol: 'none',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14314.463967475136!2d50.56877450251736!3d26.24166418615116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a5f9ad1c9b47%3A0xdc2d1e70b7e7bae7!2sDiplomatic%20Area%2C%20Manama!5e0!3m2!1sen!2sbh!4v1746620971431!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 26,
      humidity: 65,
      entrance: 45,
      center: 55,
      exit: 48,
      waterLevel: 0.45,
      airQuality: 70,
      rainfall: 8.3,
      rainfallDuration: "01:45:22",
      rainfallIntensity: 12.8
    }
  },
  {
    id: 'TUN003',
    name: 'Tubli Bay Tunnel',
    riskLevel: 'Moderate',
    waterLevel: 52,
    barrierStatus: 'Open',
    lastUpdate: new Date('2024-06-10T14:15:45'),
    guidanceDisplayEnabled: false,
    activeGuidanceSymbol: 'none',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14731.916326656636!2d50.58360386120004!3d26.257379354972944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a5fca9af7c6b%3A0xdf6b380e678d2c7d!2sShaikh%20Isa%20Causeway!5e0!3m2!1sen!2sbh!4v1746620485928!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 25,
      humidity: 68,
      entrance: 52,
      center: 58,
      exit: 50,
      waterLevel: 0.52,
      airQuality: 68,
      rainfall: 9.7,
      rainfallDuration: "02:10:48",
      rainfallIntensity: 15.5
    }
  },
  {
    id: 'TUN004',
    name: 'King Faisal Highway Tunnel',
    riskLevel: 'High',
    waterLevel: 85,
    barrierStatus: 'Closed',
    lastUpdate: new Date('2024-06-10T14:15:22'),
    guidanceDisplayEnabled: true,
    activeGuidanceSymbol: 'detour_left',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3578.4269912358!2d50.57388137836409!3d26.247801917874014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a59ce89ea001%3A0x3d6ee47eb5bb0f01!2sBahrain%20Bay!5e0!3m2!1sen!2sbh!4v1746620652446!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 30,
      humidity: 82,
      entrance: 75,
      center: 90,
      exit: 72,
      waterLevel: 0.85,
      airQuality: 55,
      rainfall: 18.9,
      rainfallDuration: "03:45:30",
      rainfallIntensity: 32.7
    }
  },
  {
    id: 'TUN005',
    name: 'Muharraq Island Tunnel',
    riskLevel: 'Moderate',
    waterLevel: 48,
    barrierStatus: 'Open',
    lastUpdate: new Date('2024-06-10T14:12:33'),
    guidanceDisplayEnabled: false,
    activeGuidanceSymbol: 'none',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28627.416297425756!2d50.555856653622676!3d26.247800426071482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a5e3ade22bc7%3A0xbf7746d09ee1f93d!2sMuharraq%20Bridge!5e0!3m2!1sen!2sbh!4v1746620809885!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 27,
      humidity: 70,
      entrance: 48,
      center: 52,
      exit: 50,
      waterLevel: 0.48,
      airQuality: 72,
      rainfall: 7.2,
      rainfallDuration: "01:20:45",
      rainfallIntensity: 10.4
    }
  },
  {
    id: 'TUN006',
    name: 'Sitra Island Tunnel',
    riskLevel: 'Low',
    waterLevel: 15,
    barrierStatus: 'Open',
    lastUpdate: new Date('2024-06-10T14:10:17'),
    guidanceDisplayEnabled: false,
    activeGuidanceSymbol: 'none',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3578.898101871623!2d50.53386497490377!3d26.232500277059113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a56880f11dd7%3A0x4c52a655ea06114c!2sSeef%20Mall!5e0!3m2!1sen!2sbh!4v1746620926836!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 24,
      humidity: 55,
      entrance: 22,
      center: 28,
      exit: 25,
      waterLevel: 0.15,
      airQuality: 85,
      rainfall: 2.8,
      rainfallDuration: "00:45:10",
      rainfallIntensity: 4.6
    }
  },
  {
    id: 'TUN007',
    name: 'Buri Village Tunnel',
    riskLevel: 'Low',
    waterLevel: 12,
    barrierStatus: 'Open',
    lastUpdate: new Date('2024-06-10T14:08:05'),
    guidanceDisplayEnabled: false,
    activeGuidanceSymbol: 'none',
    mapEmbedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28635.041414363703!2d50.5741527535395!3d26.21683392737806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a900707c0ad5%3A0x54f0491b3de5e44a!2sMINA%20SALMAN%20INTERSECTION!5e0!3m2!1sen!2sbh!4v1746620349903!5m2!1sen!2sbh" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    sensors: {
      temperature: 23,
      humidity: 52,
      entrance: 18,
      center: 20,
      exit: 15,
      waterLevel: 0.12,
      airQuality: 88,
      rainfall: 1.2,
      rainfallDuration: "00:30:05",
      rainfallIntensity: 2.4
    }
  }
];

// Mock data for users (for fallback if API fails)
export const mockUsers = [
  {
    id: 1,
    username: 'mohammed.k',
    fullName: 'Mohammed Al Khalifa',
    email: 'mohammed.k@gov.bh',
    phone: '+973 3312 4567',
    role: 'admin',
    status: 'active'
  },
  {
    id: 2,
    username: 'sara.a',
    fullName: 'Sara Ali',
    email: 'sara.a@trafficdept.bh',
    phone: '+973 3398 7654',
    role: 'manager',
    status: 'active'
  },
  {
    id: 3,
    username: 'ahmed.h',
    fullName: 'Ahmed Hassan',
    email: 'ahmed.h@mow.bh',
    phone: '+973 3345 8901',
    role: 'user',
    status: 'active'
  },
  {
    id: 4,
    username: 'fatima.j',
    fullName: 'Fatima Jaber',
    email: 'fatima.j@public.bh',
    phone: '+973 3387 5432',
    role: 'user',
    status: 'inactive'
  }
];

// Mock sensor status calculations
export const getSensorStatus = (type: string, value: number) => {
  switch (type) {
    case 'temperature':
      if (value > 30) return { status: 'Critical', class: 'danger' };
      if (value > 25) return { status: 'Warning', class: 'warning' };
      return { status: 'Normal', class: 'success' };

    case 'humidity':
      if (value > 80) return { status: 'Critical', class: 'danger' };
      if (value > 70) return { status: 'Warning', class: 'warning' };
      return { status: 'Normal', class: 'success' };

    case 'waterLevel':
      if (value > 75) return { status: 'Critical', class: 'danger' };
      if (value > 40) return { status: 'Warning', class: 'warning' };
      return { status: 'Normal', class: 'success' };

    default:
      if (value > 75) return { status: 'Critical', class: 'danger' };
      if (value > 50) return { status: 'Warning', class: 'warning' };
      return { status: 'Normal', class: 'success' };
  }
};

// Calculate risk level based on sensor values
export const calculateRiskLevel = (sensors: Record<string, number>) => {
  if (sensors.waterLevel > 75 || sensors.humidity > 80 || sensors.temperature > 32) {
    return 'High';
  } else if (sensors.waterLevel > 40 || sensors.humidity > 70 || sensors.temperature > 28) {
    return 'Moderate';
  } else {
    return 'Low';
  }
};