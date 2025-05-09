export interface Country {
  code: string
  name: string
  region: string
}

const countries: Country[] = [
  { code: "US", name: "United States", region: "North America" },
  { code: "CA", name: "Canada", region: "North America" },
  { code: "GB", name: "United Kingdom", region: "Europe" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "FR", name: "France", region: "Europe" },
  { code: "IT", name: "Italy", region: "Europe" },
  { code: "ES", name: "Spain", region: "Europe" },
  { code: "AU", name: "Australia", region: "Oceania" },
  { code: "NZ", name: "New Zealand", region: "Oceania" },
  { code: "JP", name: "Japan", region: "Asia" },
  { code: "KR", name: "South Korea", region: "Asia" },
  { code: "IN", name: "India", region: "Asia" },
  { code: "BR", name: "Brazil", region: "South America" },
  { code: "MX", name: "Mexico", region: "North America" },
  { code: "AR", name: "Argentina", region: "South America" },
  { code: "ZA", name: "South Africa", region: "Africa" },
  { code: "NG", name: "Nigeria", region: "Africa" },
  { code: "EG", name: "Egypt", region: "Africa" },
  { code: "SA", name: "Saudi Arabia", region: "Middle East" },
  { code: "AE", name: "United Arab Emirates", region: "Middle East" },
  { code: "IL", name: "Israel", region: "Middle East" },
  { code: "SG", name: "Singapore", region: "Asia" },
  { code: "MY", name: "Malaysia", region: "Asia" },
  { code: "TH", name: "Thailand", region: "Asia" },
  { code: "ID", name: "Indonesia", region: "Asia" },
  { code: "PH", name: "Philippines", region: "Asia" },
  { code: "VN", name: "Vietnam", region: "Asia" },
  { code: "RU", name: "Russia", region: "Europe" },
  { code: "TR", name: "Turkey", region: "Europe" },
  { code: "PL", name: "Poland", region: "Europe" }
]

export default countries 