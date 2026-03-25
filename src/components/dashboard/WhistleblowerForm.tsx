import { useState } from "react";
import { ShieldAlert, Send, Upload, User, Mail, Phone, MapPin, Calendar, AlertTriangle, Users, FileText, CheckCircle, Eye, EyeOff, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { EnhancedWhistleblowerReport, PersonInvolved, submitWhistleblowerReport } from "@/data/projects";

const COUNTIES = [
  "Bungoma", "Busia", "Kakamega", "Kisumu", "Migori", "Nairobi", "Mombasa", "Kilifi", "Kwale",
  "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo",
  "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Kajiado", "Kiambu",
  "Muranga", "Nyandarua", "Nyeri", "Kirinyaga", "Nyamira", "Kisii", "Homa Bay", "Siaya", "Turkana",
  "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo",
  "Laikipia", "Nakuru", "Narok", "Kajiado", "Bomet", "Kericho", "Kakamega", "Vihiga", "Bungoma", "Busia"
];

const BUNGOMA_SUB_COUNTIES = [
  "Bungoma Central", "Bungoma North", "Bungoma South", "Bungoma West", "Bungoma East",
  "Cheptais", "Kanduyi", "Kimilili", "Mt. Elgon", "Sirisia", "Tongaren", "Webuye East", "Webuye West"
];

const IMPACT_OPTIONS = [
  "Financial Loss", "Reputational Damage", "Risk to Public Safety", "Service Delivery Impact"
];

const WhistleblowerForm = () => {
  const [form, setForm] = useState<EnhancedWhistleblowerReport>({
    // Section 1: Reporter Information
    reportType: "Anonymous",
    fullName: "",
    contactEmail: "",
    phoneNumber: "",
    preferredContactMethod: "None",
    relationshipToOrg: "Citizen/Public",
    relationshipOther: "",

    // Section 2: Incident Details
    reportTitle: "",
    misconductType: "Other",
    misconductOther: "",
    incidentDescription: "",
    incidentDate: "",
    incidentDateEnd: "",
    county: "Bungoma",
    subCounty: "",
    ward: "",
    specificLocation: "",

    // Section 3: Persons Involved
    personsInvolved: [],

    // Section 4: Evidence & Documentation
    evidenceDescription: "",
    additionalWitnesses: false,
    witnessDetails: "",

    // Section 5: Impact & Risk Assessment
    estimatedImpact: [],
    issueOngoing: false,
    urgencyLevel: "Medium",

    // Section 6: Confidentiality & Consent
    confidentialityPreference: true,
    consentToContact: false,
    consentStatement: false,
    policyAcknowledgment: false,

    // Section 7: Follow-Up
    receiveUpdates: false,
    trackingCode: "",

    // Legacy fields
    projectName: "",
    evidence: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["1", "2"]);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const inputClass = "w-full h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const textareaClass = "w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y";

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const addPersonInvolved = () => {
    setForm(prev => ({
      ...prev,
      personsInvolved: [...prev.personsInvolved, {
        name: "",
        position: "",
        department: "",
        relationship: "Directly involved"
      }]
    }));
  };

  const updatePersonInvolved = (index: number, field: keyof PersonInvolved, value: string) => {
    setForm(prev => ({
      ...prev,
      personsInvolved: prev.personsInvolved.map((person, i) =>
        i === index ? { ...person, [field]: value } : person
      )
    }));
  };

  const removePersonInvolved = (index: number) => {
    setForm(prev => ({
      ...prev,
      personsInvolved: prev.personsInvolved.filter((_, i) => i !== index)
    }));
  };

  const toggleImpact = (impact: string) => {
    setForm(prev => ({
      ...prev,
      estimatedImpact: prev.estimatedImpact.includes(impact)
        ? prev.estimatedImpact.filter(i => i !== impact)
        : [...prev.estimatedImpact, impact]
    }));
  };

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `WB-${code}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Tracking code copied to clipboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.reportTitle.trim()) {
      toast.error("Please provide a report title");
      return;
    }
    if (!form.incidentDescription.trim()) {
      toast.error("Please describe the incident");
      return;
    }
    if (!form.consentStatement) {
      toast.error("Please confirm the information is true to the best of your knowledge");
      return;
    }
    if (!form.policyAcknowledgment) {
      toast.error("Please acknowledge that you have read and understood the policy");
      return;
    }

    setSubmitting(true);
    try {
      const trackingCode = generateTrackingCode();
      
      // Submit the report (you'll need to update this function)
      await submitWhistleblowerReport({
        ...form,
        trackingCode,
      });
      
      setTrackingCode(trackingCode);
      toast.success("Report submitted confidentially. Your tracking code is: " + trackingCode);
      
      // Reset form
      setForm({
        reportType: "Anonymous",
        fullName: "",
        contactEmail: "",
        phoneNumber: "",
        preferredContactMethod: "None",
        relationshipToOrg: "Citizen/Public",
        relationshipOther: "",
        reportTitle: "",
        misconductType: "Other",
        misconductOther: "",
        incidentDescription: "",
        incidentDate: "",
        incidentDateEnd: "",
        county: "Bungoma",
        subCounty: "",
        ward: "",
        specificLocation: "",
        personsInvolved: [],
        evidenceDescription: "",
        additionalWitnesses: false,
        witnessDetails: "",
        estimatedImpact: [],
        issueOngoing: false,
        urgencyLevel: "Medium",
        confidentialityPreference: true,
        consentToContact: false,
        consentStatement: false,
        policyAcknowledgment: false,
        receiveUpdates: false,
        trackingCode: "",
        projectName: "",
        evidence: "",
      });
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (trackingCode) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Report Submitted Successfully</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Your report has been submitted confidentially and securely. Save your tracking code for follow-up.
          </p>
          <div className="bg-muted/20 rounded-lg p-4 mb-4">
            <p className="text-[10px] text-muted-foreground mb-2">Your Tracking Code:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                {trackingCode}
              </code>
              <button
                onClick={() => copyToClipboard(trackingCode)}
                className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setTrackingCode(null)}
            className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Enhanced Whistleblower Report</h3>
            <p className="text-xs text-muted-foreground">All reports are confidential, anonymous, and encrypted</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Reporter Information */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("1")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">🔐 1. Reporter Information</span>
            </div>
            {expandedSections.includes("1") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("1") && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Report Type</label>
                  <select
                    value={form.reportType}
                    onChange={(e) => setForm({ ...form, reportType: e.target.value as "Anonymous" | "Identified" })}
                    className={inputClass}
                  >
                    <option value="Anonymous">Anonymous</option>
                    <option value="Identified">Identified</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Relationship to Organization</label>
                  <select
                    value={form.relationshipToOrg}
                    onChange={(e) => setForm({ ...form, relationshipToOrg: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Citizen/Public">Citizen / Public</option>
                    <option value="Vendor/Partner">Vendor / Partner</option>
                    <option value="Other">Other (specify)</option>
                  </select>
                </div>
              </div>

              {form.reportType === "Identified" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Full Name</label>
                    <input
                      className={inputClass}
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Preferred Contact Method</label>
                    <select
                      value={form.preferredContactMethod}
                      onChange={(e) => setForm({ ...form, preferredContactMethod: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              )}

              {form.relationshipToOrg === "Other" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Please specify your relationship</label>
                  <input
                    className={inputClass}
                    value={form.relationshipOther}
                    onChange={(e) => setForm({ ...form, relationshipOther: e.target.value })}
                    placeholder="Describe your relationship to the organization"
                  />
                </div>
              )}

              {form.reportType === "Identified" && form.preferredContactMethod !== "None" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {form.preferredContactMethod === "Email" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">Contact Email</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  )}
                  
                  {form.preferredContactMethod === "Phone" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">Phone Number</label>
                      <input
                        className={inputClass}
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="+254 XXX XXX XXX"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Incident Details */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("2")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">📄 2. Incident Details</span>
            </div>
            {expandedSections.includes("2") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("2") && (
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Title of Report *</label>
                <input
                  className={inputClass}
                  value={form.reportTitle}
                  onChange={(e) => setForm({ ...form, reportTitle: e.target.value })}
                  placeholder="Brief summary of the incident"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Type of Misconduct</label>
                  <select
                    value={form.misconductType}
                    onChange={(e) => setForm({ ...form, misconductType: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="Fraud">Fraud</option>
                    <option value="Corruption">Corruption</option>
                    <option value="Abuse of Office">Abuse of Office</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Financial Mismanagement">Financial Mismanagement</option>
                    <option value="Procurement Irregularities">Procurement Irregularities</option>
                    <option value="Data Misuse">Data Misuse</option>
                    <option value="Other">Other (specify)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Urgency Level</label>
                  <select
                    value={form.urgencyLevel}
                    onChange={(e) => setForm({ ...form, urgencyLevel: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {form.misconductType === "Other" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Please specify misconduct type</label>
                  <input
                    className={inputClass}
                    value={form.misconductOther}
                    onChange={(e) => setForm({ ...form, misconductOther: e.target.value })}
                    placeholder="Describe the type of misconduct"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Description of Incident *</label>
                <textarea
                  className={textareaClass}
                  value={form.incidentDescription}
                  onChange={(e) => setForm({ ...form, incidentDescription: e.target.value })}
                  placeholder="Provide detailed description of what happened, when, where, and how..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Date of Incident</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.incidentDate}
                    onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">End Date (if ongoing)</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.incidentDateEnd}
                    onChange={(e) => setForm({ ...form, incidentDateEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">County</label>
                  <select
                    value={form.county}
                    onChange={(e) => setForm({ ...form, county: e.target.value })}
                    className={inputClass}
                  >
                    {COUNTIES.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Sub-County</label>
                  <select
                    value={form.subCounty}
                    onChange={(e) => setForm({ ...form, subCounty: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select Sub-County</option>
                    {BUNGOMA_SUB_COUNTIES.map(subCounty => (
                      <option key={subCounty} value={subCounty}>{subCounty}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Ward</label>
                  <input
                    className={inputClass}
                    value={form.ward}
                    onChange={(e) => setForm({ ...form, ward: e.target.value })}
                    placeholder="Ward name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Specific Location (optional)</label>
                <input
                  className={inputClass}
                  value={form.specificLocation}
                  onChange={(e) => setForm({ ...form, specificLocation: e.target.value })}
                  placeholder="Building name, office number, etc."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="issueOngoing"
                  checked={form.issueOngoing}
                  onChange={(e) => setForm({ ...form, issueOngoing: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="issueOngoing" className="text-xs text-foreground">
                  Is this issue ongoing?
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Persons Involved */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("3")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">👥 3. Persons Involved</span>
            </div>
            {expandedSections.includes("3") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("3") && (
            <div className="p-4 space-y-4">
              {form.personsInvolved.map((person, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Person {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePersonInvolved(index)}
                      className="text-red-500 hover:text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">Name (if known)</label>
                      <input
                        className={inputClass}
                        value={person.name}
                        onChange={(e) => updatePersonInvolved(index, "name", e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">Position/Title</label>
                      <input
                        className={inputClass}
                        value={person.position}
                        onChange={(e) => updatePersonInvolved(index, "position", e.target.value)}
                        placeholder="Job title or position"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">Department/Organization Unit</label>
                      <input
                        className={inputClass}
                        value={person.department}
                        onChange={(e) => updatePersonInvolved(index, "department", e.target.value)}
                        placeholder="Department name"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">Relationship to Incident</label>
                      <select
                        className={inputClass}
                        value={person.relationship}
                        onChange={(e) => updatePersonInvolved(index, "relationship", e.target.value)}
                      >
                        <option value="Directly involved">Directly involved</option>
                        <option value="Witness">Witness</option>
                        <option value="Supervisor">Supervisor</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addPersonInvolved}
                className="h-9 px-4 rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                + Add Person
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Evidence & Documentation */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("4")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">📎 4. Evidence & Documentation</span>
            </div>
            {expandedSections.includes("4") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("4") && (
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Description of Evidence Provided</label>
                <textarea
                  className={textareaClass}
                  value={form.evidenceDescription}
                  onChange={(e) => setForm({ ...form, evidenceDescription: e.target.value })}
                  placeholder="Describe any documents, photos, videos, or other evidence you have..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Upload Supporting Files</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, MP4, MP3
                  </p>
                  <button
                    type="button"
                    className="mt-3 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="additionalWitnesses"
                  checked={form.additionalWitnesses}
                  onChange={(e) => setForm({ ...form, additionalWitnesses: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="additionalWitnesses" className="text-xs text-foreground">
                  Are there additional witnesses?
                </label>
              </div>

              {form.additionalWitnesses && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Witness Details</label>
                  <textarea
                    className={textareaClass}
                    value={form.witnessDetails}
                    onChange={(e) => setForm({ ...form, witnessDetails: e.target.value })}
                    placeholder="Provide details about additional witnesses (names, contact information if available, what they witnessed)..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 5: Impact & Risk Assessment */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("5")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">⚠️ 5. Impact & Risk Assessment</span>
            </div>
            {expandedSections.includes("5") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("5") && (
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Estimated Impact</label>
                <div className="grid grid-cols-2 gap-2">
                  {IMPACT_OPTIONS.map(impact => (
                    <label key={impact} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.estimatedImpact.includes(impact)}
                        onChange={() => toggleImpact(impact)}
                        className="rounded border-border"
                      />
                      {impact}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Confidentiality & Consent */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("6")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {form.confidentialityPreference ? <EyeOff className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4 text-primary" />}
              <span className="text-sm font-bold text-foreground">🛡️ 6. Confidentiality & Consent</span>
            </div>
            {expandedSections.includes("6") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("6") && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confidentiality"
                  checked={form.confidentialityPreference}
                  onChange={(e) => setForm({ ...form, confidentialityPreference: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="confidentiality" className="text-xs text-foreground">
                  Keep my identity confidential
                </label>
              </div>

              {form.reportType === "Identified" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consentToContact"
                    checked={form.consentToContact}
                    onChange={(e) => setForm({ ...form, consentToContact: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="consentToContact" className="text-xs text-foreground">
                    I consent to being contacted about this report
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consentStatement"
                  checked={form.consentStatement}
                  onChange={(e) => setForm({ ...form, consentStatement: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="consentStatement" className="text-xs text-foreground">
                  I confirm that the information provided is true to the best of my knowledge.
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="policyAcknowledgment"
                  checked={form.policyAcknowledgment}
                  onChange={(e) => setForm({ ...form, policyAcknowledgment: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="policyAcknowledgment" className="text-xs text-foreground">
                  I have read and understood the <a href="#" className="text-primary hover:underline">Whistleblower Protection Policy</a>.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Follow-Up */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("7")}
            className="w-full p-4 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">🔄 7. Follow-Up</span>
            </div>
            {expandedSections.includes("7") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.includes("7") && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="receiveUpdates"
                  checked={form.receiveUpdates}
                  onChange={(e) => setForm({ ...form, receiveUpdates: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="receiveUpdates" className="text-xs text-foreground">
                  Would you like to receive updates about this report?
                </label>
              </div>

              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground mb-2">
                  <strong>Note:</strong> After submission, you will receive a unique tracking code that you can use to check the status of your report anonymously.
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Please save this tracking code securely for future reference.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="h-12 px-8 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting Report..." : "Submit Confidential Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WhistleblowerForm;
