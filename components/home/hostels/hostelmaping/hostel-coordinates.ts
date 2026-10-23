import { CityHostel } from "@/types/hostel.types";

// City default coordinates [latitude, longitude]
export const CITY_COORDINATES: Record<string, [number, number]> = {
    chennai: [13.0827, 80.2707],
    hyderabad: [17.3850, 78.4867],
    bangalore: [12.9716, 77.5946],
    bengaluru: [12.9716, 77.5946],
    pune: [18.5204, 73.8567],
    mumbai: [19.0760, 72.8777],
    delhi: [28.6139, 77.2090],
    kolkata: [22.5726, 88.3639],
    ahmedabad: [23.0225, 72.5714],
    nagarkurnool: [16.4842, 78.3168],
    hampi: [15.3350, 76.4600],
};

// Known neighborhood area coordinates for dynamic area-based map rendering
export const AREA_COORDINATES: Record<string, [number, number]> = {
    // Chennai
    "t nagar": [13.0418, 80.2341],
    "t. nagar": [13.0418, 80.2341],
    "adyar": [13.0012, 80.2565],
    "velachery": [12.9759, 80.2212],
    "guindy": [13.0067, 80.2026],
    "omr": [12.9165, 80.2285],
    "thiruvanmiyur": [12.9830, 80.2594],
    "anna nagar": [13.0850, 80.2101],
    "nungambakkam": [13.0569, 80.2425],
    "mylapore": [13.0368, 80.2676],
    "porur": [13.0382, 80.1565],
    "tambaram": [12.9249, 80.1000],
    "sholinganallur": [12.8997, 80.2279],
    "perungudi": [12.9654, 80.2461],
    "egmore": [13.0827, 80.2707],
    "kodambakkam": [13.0524, 80.2255],
    "saidapet": [13.0213, 80.2231],
    "besant nagar": [13.0003, 80.2667],

    // Hyderabad
    "gachibowli": [17.4401, 78.3489],
    "hitec city": [17.4435, 78.3772],
    "hitech city": [17.4435, 78.3772],
    "madhapur": [17.4483, 78.3915],
    "kphb": [17.4938, 78.4018],
    "kphb colony": [17.4938, 78.4018],
    "ameerpet": [17.4375, 78.4482],
    "sr nagar": [17.4434, 78.4449],
    "banjara hills": [17.4156, 78.4357],
    "jubilee hills": [17.4319, 78.4073],
    "kondapur": [17.4667, 78.3582],
    "kukatpally": [17.4947, 78.4116],
    "lb nagar": [17.3457, 78.5522],
    "dilsukhnagar": [17.3688, 78.5247],
    "begumpet": [17.4447, 78.4664],
    "secunderabad": [17.4399, 78.4983],
    "miyapur": [17.4968, 78.3547],
    "manikonda": [17.3992, 78.3758],
    "somajiguda": [17.4256, 78.4583],
    "mehdipatnam": [17.3916, 78.4398],
    "uppal": [17.4057, 78.5592],

    // Bangalore
    "koramangala": [12.9352, 77.6245],
    "hsr layout": [12.9121, 77.6446],
    "indiranagar": [12.9784, 77.6408],
    "btm layout": [12.9166, 77.6101],
    "whitefield": [12.9698, 77.7500],
    "marathahalli": [12.9591, 77.6974],
    "electronic city": [12.8399, 77.6770],
    "bellandur": [12.9260, 77.6762],
    "jayanagar": [12.9308, 77.5838],
    "jp nagar": [12.9063, 77.5857],
    "hebbal": [13.0358, 77.5970],
    "yelahanka": [13.1007, 77.5963],
    "rajajinagar": [12.9982, 77.5530],
    "malleshwaram": [13.0031, 77.5643],

    // Pune
    "hinjawadi": [18.5913, 73.7389],
    "hinjewadi": [18.5913, 73.7389],
    "viman nagar": [18.5679, 73.9143],
    "kothrud": [18.5074, 73.8077],
    "baner": [18.5590, 73.7868],
    "wakad": [18.5987, 73.7684],
    "koregaon park": [18.5362, 73.8940],
    "hadapsar": [18.5089, 73.9259],
    "shivajinagar": [18.5314, 73.8446],
    "magarpatta": [18.5134, 73.9312],
    "kharadi": [18.5516, 73.9349],
    "aundh": [18.5626, 73.8087],
    "pimpri": [18.6298, 73.7997],

    // Mumbai
    "andheri": [19.1136, 72.8697],
    "bandra": [19.0596, 72.8295],
    "powai": [19.1176, 72.9060],
    "dadar": [19.0178, 72.8478],
    "borivali": [19.2307, 72.8567],
    "juhu": [19.1075, 72.8263],
    "colaba": [18.9067, 72.8147],
    "malad": [19.1874, 72.8484],
    "goregaon": [19.1663, 72.8526],
    "kurla": [19.0726, 72.8845],
    "thane": [19.2183, 72.9781],
    "santacruz": [19.0843, 72.8360],

    // Delhi
    "connaught place": [28.6315, 77.2167],
    "hauz khas": [28.5494, 77.2001],
    "lajpat nagar": [28.5677, 77.2433],
    "karol bagh": [28.6514, 77.1907],
    "saket": [28.5244, 77.2100],
    "dwarka": [28.5843, 77.0498],
    "rohini": [28.7495, 77.0565],

    // Nagarkurnool & Hampi
    "nagar kurno": [16.4842, 78.3168],
    "virupapur gaddi": [15.3440, 76.4630],
};

export function getHostelCoordinates(hostel: CityHostel, cityName: string): [number, number] {
    const rawCity = (hostel.city_name || cityName || "").toLowerCase().trim();
    const cityBase = CITY_COORDINATES[rawCity] || CITY_COORDINATES["chennai"] || [13.0827, 80.2707];

    // 1. If backend returns valid coordinates, verify they belong to this city (within ~40km)
    // This protects against dummy test data where Hyderabad coordinates were seeded for Chennai/Mumbai hostels
    if (hostel.latitude && hostel.longitude) {
        const lat = Number(hostel.latitude);
        const lng = Number(hostel.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            const distFromCity = Math.hypot(lat - cityBase[0], lng - cityBase[1]);
            if (distFromCity < 0.45) {
                return [lat, lng];
            }
        }
    }

    // 2. Try Area match for real locality coordinates
    const areaLower = (hostel.area_name || "").toLowerCase().trim();
    if (areaLower && AREA_COORDINATES[areaLower]) {
        const [baseLat, baseLng] = AREA_COORDINATES[areaLower];
        // Deterministic micro-offset to prevent overlapping pins
        const offsetLat = ((Number(hostel.id) * 17) % 19 - 9) * 0.0016;
        const offsetLng = ((Number(hostel.id) * 23) % 19 - 9) * 0.0016;
        return [baseLat + offsetLat, baseLng + offsetLng];
    }

    // 3. Fallback to city center with deterministic natural spread
    const angle = ((Number(hostel.id) * 137.5) * Math.PI) / 180;
    const radius = 0.008 + ((Number(hostel.id) % 7) * 0.0035);
    return [cityBase[0] + radius * Math.cos(angle), cityBase[1] + radius * Math.sin(angle)];
}
