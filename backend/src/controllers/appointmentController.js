export const getVerifiedHospitals = (req, res) => {
    // Simulated Validation Engine Database specific to Koni, Bilaspur
    const mockHospitals = [
        {
            id: 'hosp_1',
            name: "CIMS (Chhattisgarh Institute of Medical Sciences) Bilaspur",
            location: "Koni, Bilaspur (Pin: 495009)",
            primaryNumber: "07752-230030",
            primaryType: "Reception/Landline",
            whatsappNumber: "919876543210", // Mocked format for direct WA
            sources: ["Official Hospital Portal (cimsbilaspur.ac.in)", "Google Business"],
            isGovVerified: true,
            lastVerified: "Verified 2 days ago",
            categories: ["General Hospital", "Emergency", "Multispecialty"]
        },
        {
            id: 'hosp_2',
            name: "Apollo Hospitals, City Centre",
            location: "Seepat Road, near Koni, Bilaspur",
            primaryNumber: "07752-416300",
            primaryType: "Reception/Landline",
            whatsappNumber: "919876543211", 
            sources: ["Official Portal (apollohospitals.com)", "Practo (High Call Pick-up Rate)"],
            isGovVerified: false,
            lastVerified: "Verified 5 hours ago",
            categories: ["Private", "Specialty Services", "Advanced Diagnostics"]
        },
        {
            id: 'hosp_3',
            name: "District Hospital Bilaspur",
            location: "Near Koni, Bilaspur",
            primaryNumber: "07752-224422",
            primaryType: "Reception/Landline",
            whatsappNumber: null, // Government hospitals often don't have direct WA appointments
            sources: ["bilaspur.gov.in", "Google Business"],
            isGovVerified: true,
            lastVerified: "Verified 1 week ago",
            categories: ["Govt Hospital", "Public Utility", "Emergency"]
        },
        {
            id: 'hosp_4',
            name: "Koni Community Health Clinic",
            location: "Main Road, Koni, Bilaspur (Pin: 495009)",
            primaryNumber: "07752-255555",
            primaryType: "Reception/Landline",
            whatsappNumber: "919876543212", 
            sources: ["Justdial (High Pick-up Rate)", "Google Business"],
            isGovVerified: false,
            lastVerified: "Verified 1 day ago",
            categories: ["Clinic", "Primary Care"]
        }
    ];

    res.json(mockHospitals);
};
