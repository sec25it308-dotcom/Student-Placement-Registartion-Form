import { useEffect, useState } from 'react'
import './App.css'

const COMPANIES = [
  'Wipro',
  'HCLTech',
  'Accenture',
  'Infosys',
  'TCS',
  'Cognizant',
  'Capgemini',
  'IBM',
  'Deloitte',
  'Tech Mahindra',
]

const EMPTY_PROFILE = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  phone: '',
  email: '',
  fatherName: '',
  motherName: '',
  arrears: '0',
}

const FIELDS = [
  { name: 'name', label: 'Student name', placeholder: 'Full name', autocomplete: 'name' },
  { name: 'studentId', label: 'Student ID', placeholder: 'e.g. 21CS1042' },
  { name: 'department', label: 'Department', type: 'select', options: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical', 'Civil', 'Other'] },
  { name: 'year', label: 'Year of study', type: 'select', options: ['1st year', '2nd year', '3rd year', '4th year'] },
  { name: 'section', label: 'Section', placeholder: 'e.g. A' },
  { name: 'bloodGroup', label: 'Blood group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  { name: 'phone', label: 'Phone number', placeholder: '10-digit mobile number', type: 'tel', autocomplete: 'tel' },
  { name: 'email', label: 'Email address', placeholder: 'you@college.edu', type: 'email', autocomplete: 'email' },
  { name: 'fatherName', label: "Father's name", placeholder: 'Full name', autocomplete: 'off' },
  { name: 'motherName', label: "Mother's name", placeholder: 'Full name', autocomplete: 'off' },
  { name: 'arrears', label: 'Standing arrears', type: 'number', min: '0' },
]

function App() {
  const [view, setView] = useState('student')
  const [stage, setStage] = useState('details')
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [pendingStudent, setPendingStudent] = useState(null)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [search, setSearch] = useState('')
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadRegistrations() {
      try {
        const response = await fetch('/api/registrations')
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load registrations')
        if (isMounted) setRegistrations(data)
      } catch (error) {
        if (isMounted) setApiError(error.message || 'Unable to connect to the registration server')
      } finally {
        if (isMounted) setIsLoadingRegistrations(false)
      }
    }

    loadRegistrations()
    return () => { isMounted = false }
  }, [])

  async function saveRegistration(student) {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    })
    const data = await response.json()
    if (!response.ok) {
      const fieldErrors = data.errors ? Object.values(data.errors).join('. ') : ''
      throw new Error(fieldErrors || data.message || 'Unable to save registration')
    }
    setRegistrations((current) => [data, ...current])
    return data
  }

  async function handleDetailsSubmit(event) {
    event.preventDefault()
    setApiError('')
    setIsSubmitting(true)
    const student = {
      ...profile,
      arrears: Number(profile.arrears),
      companies: [],
    }

    try {
      if (student.arrears === 0) {
        setPendingStudent(student)
        setStage('companies')
      } else {
        await saveRegistration(student)
        setStage('ineligible')
      }
    } catch (error) {
      setApiError(error.message || 'Unable to save registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleCompany(company) {
    setSelectedCompanies((current) => {
      if (current.includes(company)) return current.filter((item) => item !== company)
      if (current.length === 4) return current
      return [...current, company]
    })
  }

  async function finishRegistration() {
    setApiError('')
    setIsSubmitting(true)
    try {
      await saveRegistration({ ...pendingStudent, companies: selectedCompanies })
      setStage('complete')
    } catch (error) {
      setApiError(error.message || 'Unable to save registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startAnotherRegistration() {
    setProfile(EMPTY_PROFILE)
    setPendingStudent(null)
    setSelectedCompanies([])
    setApiError('')
    setStage('details')
  }

  const eligibleCount = registrations.filter((student) => student.arrears === 0).length
  const filteredRegistrations = (company) => registrations.filter((student) => {
    const matchesCompany = student.companies.includes(company)
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [student.name, student.studentId, student.department, student.email]
      .some((value) => value.toLowerCase().includes(query))
    return matchesCompany && matchesSearch
  })

  return (
    <div className="portal-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setView('student')} aria-label="Campus to career home">
          <span className="brand-mark">CC</span>
          <span className="brand-copy"><strong>Campus to Career</strong><small>PLACEMENT CELL</small></span>
        </a>
        <nav className="view-switch" aria-label="Portal view">
          <button className={view === 'student' ? 'view-tab active' : 'view-tab'} onClick={() => setView('student')} type="button">Student portal</button>
          <button className={view === 'admin' ? 'view-tab active' : 'view-tab'} onClick={() => setView('admin')} type="button">Admin view</button>
        </nav>
        <div className="academic-year"><span className="status-dot" /> 2025–26 registrations</div>
      </header>

      {view === 'student' ? (
        <main className="student-page">
          <section className="intro-band">
            <div className="intro-copy">
              <p className="eyebrow">CAREER SERVICES <span> / </span> STUDENT INTAKE</p>
              <h1>Your next chapter<br /><em>starts here.</em></h1>
              <p className="intro-description">Complete your student profile to begin the campus placement registration process.</p>
            </div>
            <div className="intake-note"><span className="note-index">01</span><p>PLACEMENT<br />REGISTRATION</p><span className="note-rule" /><small>ACADEMIC YEAR<br />2025 — 2026</small></div>
          </section>

          <div className="form-layout">
            <aside className="step-rail" aria-label="Registration steps">
              <div className={stage === 'details' || stage === 'ineligible' || stage === 'complete' ? 'rail-step current' : 'rail-step'}><span>01</span><div><strong>Student details</strong><small>Personal & academic</small></div></div>
              <div className="rail-line" />
              <div className={stage === 'companies' ? 'rail-step current' : 'rail-step'}><span>02</span><div><strong>Company choices</strong><small>Eligible students only</small></div></div>
              <div className="rail-caption">Your information is used by the college placement cell for recruitment coordination.</div>
            </aside>

            <section className="form-panel">
              {apiError && <p className="form-error" role="alert">{apiError}</p>}
              {stage === 'details' && (
                <>
                  <div className="section-heading"><div><p className="eyebrow">STEP 01 <span> / </span> PROFILE</p><h2>Student details</h2></div><span className="required-note">* Required fields</span></div>
                  <form onSubmit={handleDetailsSubmit}>
                    <div className="field-grid">
                      {FIELDS.map((field) => (
                        <label className={`field ${field.name === 'arrears' ? 'field-highlight' : ''}`} key={field.name}>
                          <span>{field.label}<b aria-hidden="true"> *</b></span>
                          {field.type === 'select' ? (
                            <select required value={profile[field.name]} onChange={(event) => setProfile({ ...profile, [field.name]: event.target.value })}>
                              <option value="" disabled>Select {field.label.toLowerCase()}</option>
                              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          ) : (
                            <input
                              required
                              type={field.type || 'text'}
                              min={field.min}
                              minLength={field.name === 'phone' ? 10 : undefined}
                              maxLength={field.name === 'phone' ? 15 : undefined}
                              pattern={field.name === 'phone' ? '[0-9]{10,15}' : undefined}
                              autoComplete={field.autocomplete}
                              placeholder={field.placeholder}
                              value={profile[field.name]}
                              onChange={(event) => setProfile({ ...profile, [field.name]: event.target.value })}
                            />
                          )}
                          {field.name === 'arrears' && <small className="field-hint">Students with zero standing arrears can select companies.</small>}
                        </label>
                      ))}
                    </div>
                    <div className="form-footer"><p>By continuing, you confirm these details are accurate.</p><button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving…' : 'Continue'} <span aria-hidden="true">→</span></button></div>
                  </form>
                </>
              )}

              {stage === 'companies' && (
                <div className="choice-stage">
                  <div className="section-heading"><div><p className="eyebrow">STEP 02 <span> / </span> COMPANY PREFERENCES</p><h2>Choose your four</h2></div><span className="choice-counter"><strong>{selectedCompanies.length}</strong> / 4 selected</span></div>
                  <p className="choice-description">Your profile is eligible for placement. Select exactly four companies to complete your registration.</p>
                  <div className="company-grid">
                    {COMPANIES.map((company, index) => {
                      const selected = selectedCompanies.includes(company)
                      const disabled = selectedCompanies.length === 4 && !selected
                      return <button className={`company-option ${selected ? 'selected' : ''}`} disabled={disabled} key={company} onClick={() => toggleCompany(company)} type="button" aria-pressed={selected}>
                        <span className="company-number">{String(index + 1).padStart(2, '0')}</span><strong>{company}</strong><span className="selection-indicator" aria-hidden="true">{selected ? '✓' : '+'}</span>
                      </button>
                    })}
                  </div>
                  <div className="form-footer choice-footer"><button className="back-button" onClick={() => setStage('details')} type="button">← Edit student details</button><button className="primary-button" disabled={selectedCompanies.length !== 4 || isSubmitting} onClick={finishRegistration} type="button">{isSubmitting ? 'Saving…' : 'Submit registration'} <span aria-hidden="true">→</span></button></div>
                </div>
              )}

              {(stage === 'complete' || stage === 'ineligible') && (
                <div className="confirmation-panel">
                  <span className={stage === 'complete' ? 'confirmation-icon' : 'confirmation-icon muted'} aria-hidden="true">{stage === 'complete' ? '✓' : 'i'}</span>
                  <p className="eyebrow">REGISTRATION {stage === 'complete' ? 'SUBMITTED' : 'RECORDED'}</p>
                  <h2>{stage === 'complete' ? 'You’re on your way.' : 'Profile received.'}</h2>
                  <p>{stage === 'complete' ? `Thanks, ${pendingStudent?.name}. Your four company preferences have been saved.` : `Thanks, ${profile.name}. Students with standing arrears are not eligible to select companies at this time.`}</p>
                  {stage === 'complete' && <div className="submitted-companies"><span>YOUR COMPANY PREFERENCES</span><div>{selectedCompanies.map((company) => <b key={company}>{company}</b>)}</div></div>}
                  <button className="primary-button" onClick={startAnotherRegistration} type="button">Register another student <span aria-hidden="true">→</span></button>
                </div>
              )}
            </section>
          </div>
        </main>
      ) : (
        <main className="admin-page">
          <section className="admin-heading">
            <div><p className="eyebrow">CAREER SERVICES <span> / </span> ADMINISTRATION</p><h1>Placement roster</h1><p>Student registrations, organized by company preference.</p></div>
            <div className="admin-stats"><div><strong>{registrations.length}</strong><span>PROFILES</span></div><div><strong>{eligibleCount}</strong><span>ELIGIBLE</span></div><div><strong>{COMPANIES.length}</strong><span>COMPANIES</span></div></div>
          </section>

          {apiError && <p className="form-error" role="alert">{apiError}</p>}

          <div className="roster-toolbar"><div><span className="toolbar-marker" /> COMPANY ROSTER <span className="toolbar-count">{registrations.length} total</span></div><label className="search-field"><span className="search-icon" aria-hidden="true">⌕</span><input type="search" placeholder="Search students" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search student name, ID, department, or email" /></label></div>

          <div className="company-roster">
            {COMPANIES.map((company, index) => {
              const students = filteredRegistrations(company)
              return <section className="roster-company" key={company}>
                <div className="roster-company-heading"><span className="roster-index">{String(index + 1).padStart(2, '0')}</span><h2>{company}</h2><span className="roster-company-count">{students.length} {students.length === 1 ? 'student' : 'students'}</span><span className="roster-chevron" aria-hidden="true">↘</span></div>
                {students.length > 0 ? <div className="roster-table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>DEPARTMENT</th><th>YEAR / SECTION</th><th>PHONE</th><th>EMAIL</th></tr></thead><tbody>{students.map((student, studentIndex) => <tr key={`${student.studentId}-${studentIndex}`}><td><strong>{student.name}</strong><small>{student.bloodGroup} · {student.arrears} standing arrears</small></td><td>{student.studentId}</td><td>{student.department}</td><td>{student.year} · {student.section}</td><td>{student.phone}</td><td>{student.email}</td></tr>)}</tbody></table></div> : <p className="empty-roster">{isLoadingRegistrations ? 'Loading registrations…' : search ? 'No matching students for this company.' : 'No students have selected this company yet.'}</p>}
              </section>
            })}
          </div>
          <p className="admin-footnote">Registration records are served from the placement database.</p>
        </main>
      )}

      <footer className="site-footer"><span>CAREER SERVICES OFFICE</span><span>SUPPORTING YOUR NEXT STEP</span></footer>
    </div>
  )
}

export default App