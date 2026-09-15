export const hospitals = {
  "hospital-a": { name: "St. Ananya Children's Hospital", city: "Bengaluru", code: "HOSP-A", initials: "SA", contact: "+91 80 4567 8900", email: "raredesk@stananya.org" },
  "hospital-b": { name: "National Genetics Institute", city: "Hyderabad", code: "HOSP-B", initials: "NG", contact: "+91 40 2345 6712", email: "collab@ngi.example" },
  "hospital-c": { name: "Western Medical Centre", city: "Pune", code: "HOSP-C", initials: "WM", contact: "+91 20 7788 1200", email: "rarecare@wmc.example" }
};

export const symptomCatalog = [
  { id: "s1", name: "Recurrent fever", category: "Immune / inflammatory", hpo: "HP:0001954", score: 0.96, hospitals: ["hospital-a", "hospital-b"], points: [[18, 30, 0.8], [29, 48, 0.6], [42, 37, 0.9], [58, 61, 0.72], [73, 44, 0.55], [82, 67, 0.84]] },
  { id: "s2", name: "Joint pain", category: "Musculoskeletal", hpo: "HP:0002829", score: 0.91, hospitals: ["hospital-a", "hospital-c"], points: [[22, 62, 0.65], [34, 38, 0.84], [48, 52, 0.78], [61, 29, 0.9], [77, 57, 0.63], [88, 36, 0.73]] },
  { id: "s3", name: "Enlarged spleen", category: "Hematologic", hpo: "HP:0001744", score: 0.88, hospitals: ["hospital-b", "hospital-c"], points: [[17, 47, 0.74], [38, 67, 0.8], [54, 34, 0.64], [69, 55, 0.92], [84, 29, 0.67]] },
  { id: "s4", name: "Muscle weakness", category: "Neuromuscular", hpo: "HP:0001324", score: 0.84, hospitals: ["hospital-a", "hospital-c"], points: [[25, 35, 0.56], [45, 62, 0.81], [64, 45, 0.74], [80, 61, 0.88]] },
  { id: "s5", name: "Seizures", category: "Neurologic", hpo: "HP:0001250", score: 0.79, hospitals: ["hospital-b"], points: [[31, 26, 0.7], [57, 42, 0.83], [76, 68, 0.6]] }
];

export function getHeatmapData(symptomId) { return symptomCatalog.find(s => s.id === symptomId) ?? symptomCatalog[0]; }
export function searchSymptoms(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return symptomCatalog.map(s => ({ ...s, match: s.name.toLowerCase().includes(q) ? 1 : Math.max(0.52, s.score - Math.min(0.22, Math.abs(s.name.length - q.length) / 100)) }))
    .sort((a, b) => b.match - a.match).slice(0, 4);
}
