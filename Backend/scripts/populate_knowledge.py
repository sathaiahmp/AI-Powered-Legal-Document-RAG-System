import os
import sys

# Add parent directory to path to import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config import Config

config = Config()
pdfs_dir = config.PDFS_DIRECTORY

# Ensure pdfs directory exists
os.makedirs(pdfs_dir, exist_ok=True)

# 1. Legal Forms Templates
legal_forms_content = """
LEGAL FORMS AND AGREEMENTS TEMPLATES

A. CONTRACTS & AGREEMENTS

1. SALE AGREEMENT FORMAT
[Date]
BETWEEN: [Seller Name], (hereinafter referred to as the "SELLER")
AND: [Buyer Name], (hereinafter referred to as the "BUYER")
PROPERTY DETAILS: [Complete Address and Description]
SALE CONSIDERATION: Rs. [Amount]
TERMS:
1. The Seller agrees to sell and the Buyer agrees to purchase the property...
2. The Buyer has paid an advance of Rs. [Amount]...
3. The balance amount shall be paid by [Date]...
[Signatures]

2. RENT AGREEMENT FORMAT
[Date]
LANDLORD: [Name], [Address]
TENANT: [Name], [Address]
PREMISES: [Address of Rented Property]
RENT: Rs. [Amount] per month
SECURITY DEPOSIT: Rs. [Amount]
TERM: 11 Months
TERMS:
1. The Tenant shall pay rent on or before the [Day] of every month.
2. The premises shall be used for residential purposes only.
3. Either party can terminate this agreement with [Number] months notice.
[Signatures]

3. NON-DISCLOSURE AGREEMENT (NDA)
This Agreement is made on [Date] between [Disclosing Party] and [Receiving Party].
PURPOSE: To prevent the unauthorized disclosure of Confidential Information.
OBLIGATIONS:
1. The Receiving Party shall hold the Confidential Information in strict confidence.
2. The Information shall be used solely for the purpose of [Purpose].
3. This obligation survives the termination of this agreement for [Number] years.
[Signatures]

4. EMPLOYMENT AGREEMENT
EMPLOYER: [Company Name]
EMPLOYEE: [Employee Name]
POSITION: [Job Title]
SALARY: Rs. [Amount] per annum
TERMS:
1. Appointment is effective from [Date].
2. Probation period is [Number] months.
3. Notice period for termination is [Number] months.
[Signatures]

B. NOTICES

1. LEGAL NOTICE FOR RECOVERY OF MONEY
To,
[Debtor Name]
[Address]
Subject: Legal Notice for recovery of Rs. [Amount]
Sir/Madam,
Under instructions from my client [Client Name], I hereby state:
1. You borrowed Rs. [Amount] from my client on [Date].
2. You promised to repay by [Date] but failed to do so.
3. I call upon you to pay the said amount within 15 days, failing which legal action will be initiated.
[Advocate Name & Signature]

2. LEGAL NOTICE FOR CHEQUE BOUNCE (Section 138 NI Act)
To,
[Drawer Name]
Subject: Notice under Section 138 of Negotiable Instruments Act.
1. You issued Cheque No. [Number] dated [Date] for Rs. [Amount].
2. The cheque was returned unpaid with remarks "Insufficient Funds".
3. Demand is hereby made to pay the amount within 15 days of receipt of this notice.

C. AFFIDAVITS

1. AFFIDAVIT FOR NAME CHANGE
I, [Old Name], s/o [Father's Name], residing at [Address], do hereby solemnly affirm:
1. That my recorded name is [Old Name].
2. That I have changed my name to [New Name].
3. That all my future records should reflect [New Name].
Deponent: [Signature]
Verification: Verified at [Place] on [Date] that contents are true.

2. AFFIDAVIT FOR ADDRESS PROOF
I, [Name], do hereby declare that I am residing at [Complete Address] for the past [Number] years.
This affidavit is submitted as proof of residence for [Purpose].

D. PETITIONS

1. MUTUAL CONSENT DIVORCE PETITION (Section 13B Hindu Marriage Act)
IN THE FAMILY COURT AT [Place]
Petitioner 1: [Husband Name]
Petitioner 2: [Wife Name]
1. The marriage was solemnized on [Date].
2. The parties have been living separately since [Date].
3. They have mutually agreed to dissolve the marriage.
Prayer: Grant a decree of divorce by mutual consent.

E. PROPERTY FORMS

1. POWER OF ATTORNEY (General)
I, [Principal Name], do hereby appoint [Agent Name] as my true and lawful Attorney to do the following acts:
1. To manage my property at [Address].
2. To sign documents and represent me before authorities.
IN WITNESS WHEREOF I have signed this deed on [Date].

F. BUSINESS FORMS

1. COMPANY INCORPORATION DOCUMENTS
- SPICe+ Form (Simplified Proforma for Incorporating Company Electronically)
- MOA (Memorandum of Association): Defines company objectives.
- AOA (Articles of Association): Defines internal rules.

G. COURT FORMS

1. FIR FORMAT (First Information Report)
To, The Station House Officer, [Police Station Name]
Subject: Complaint regarding [Offense]
1. Complainant: [Name]
2. Incident Date/Time: [Date/Time]
3. Place of Incident: [Location]
4. Description: [Detailed account of what happened]
Request to register FIR and take action.
"""

with open(os.path.join(pdfs_dir, "01_Legal_Forms_Templates.txt"), "w", encoding="utf-8") as f:
    f.write(legal_forms_content)

# 2. Indian Constitution
constitution_content = """
INDIAN CONSTITUTION - KEY FEATURES AND ARTICLES

A. PREAMBLE
"WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:
JUSTICE, social, economic and political;
LIBERTY of thought, expression, belief, faith and worship;
EQUALITY of status and of opportunity;
and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation..."

Keywords:
- Sovereign: Independent authority.
- Socialist: Social and economic equality.
- Secular: No state religion.
- Democratic: Government by the people.
- Republic: Head of state is elected (President).

B. FUNDAMENTAL RIGHTS (Part III, Articles 12-35)
1. Right to Equality (Art 14-18): Equality before law, prohibition of discrimination.
2. Right to Freedom (Art 19-22): Speech, assembly, association, movement, residence, profession.
   - Art 21: Protection of Life and Personal Liberty.
3. Right Against Exploitation (Art 23-24): Human trafficking, child labour.
4. Right to Freedom of Religion (Art 25-28).
5. Cultural and Educational Rights (Art 29-30).
6. Right to Constitutional Remedies (Art 32): Heart and soul of the Constitution. Power to approach Supreme Court.

C. FUNDAMENTAL DUTIES (Part IV-A, Art 51A)
- Respect the National Flag and Anthem.
- Cherish the ideals of the freedom struggle.
- Protect sovereignty, unity, and integrity of India.
- Safeguard public property.

D. DIRECTIVE PRINCIPLES OF STATE POLICY (DPSP) (Part IV)
Guidelines for the government to create a just society (e.g., Equal pay, Uniform Civil Code, Village Panchayats).

E. IMPORTANT ARTICLES
- Art 14: Equality before law.
- Art 19: Six freedoms (Speech, etc.).
- Art 21: Right to Life (Expanded to include privacy, environment, etc.).
- Art 32: Writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto).
- Art 44: Uniform Civil Code.
- Art 226: Power of High Courts to issue writs.
- Art 368: Power of Parliament to amend the Constitution.
- Art 370: Special status to J&K (Abrogated).

F. STRUCTURE OF GOVERNMENT
1. President: Head of State, Commander-in-Chief.
2. Prime Minister: Head of Government.
3. Parliament: Lok Sabha (Lower House) + Rajya Sabha (Upper House).
4. Judiciary: Supreme Court -> High Courts -> District Courts.

G. SCHEDULES
1st: List of States & UTs.
7th: Division of powers (Union List, State List, Concurrent List).
8th: Official Languages (22 languages).
10th: Anti-Defection Law.
"""

with open(os.path.join(pdfs_dir, "02_Indian_Constitution_Key_Features.txt"), "w", encoding="utf-8") as f:
    f.write(constitution_content)

# 3. Major Acts
acts_content = """
MAJOR INDIAN LEGAL ACTS SUMMARY

A. INDIAN PENAL CODE (IPC) / BHARATIYA NYAYA SANHITA (BNS)
(Note: IPC is being replaced by BNS, but IPC concepts remain relevant for historical cases)
Key Offenses:
- Theft (Sec 378 IPC): Moving movable property without consent.
- Murder (Sec 300/302 IPC): Culpable homicide amounting to murder.
- Cheating (Sec 415/420 IPC): Deceiving to deliver property.
- Assault (Sec 351 IPC): Gesture causing apprehension of force.
- Defamation (Sec 499 IPC): Harming reputation.

B. CODE OF CRIMINAL PROCEDURE (CrPC) / BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS)
- FIR (First Information Report): Section 154 CrPC. First step in criminal case.
- Arrest: Police can arrest with or without warrant depending on offense (Cognizable/Non-cognizable).
- Bail:
  - Bailable Offense: Right to bail.
  - Non-Bailable Offense: Court discretion.
  - Anticipatory Bail: Pre-arrest bail (Sec 438 CrPC).

C. INDIAN EVIDENCE ACT / BHARATIYA SAKSHYA ADHINIYAM
- Evidence: Oral, Documentary, Electronic.
- Burden of Proof: Usually on the prosecution/plaintiff.
- Confession: To police is generally not admissible.

D. CONSUMER PROTECTION ACT, 2019
- Rights: Safety, Information, Choice, Heard, Redressal, Education.
- CCPA: Central Consumer Protection Authority.
- Dispute Redressal: District Commission (<1 Cr), State Commission (1-10 Cr), National Commission (>10 Cr).
- Product Liability: Manufacturer/Seller liable for defective products.

E. LABOUR LAWS
- Factories Act: Health, safety, welfare of workers.
- Minimum Wages Act: Fixes minimum rates of wages.
- Industrial Disputes Act: Handling strikes, lockouts, layoffs.
- POSH Act: Prevention of Sexual Harassment at Workplace.

F. INFORMATION TECHNOLOGY ACT, 2000 (IT Act)
- Sec 43: Damage to computer systems.
- Sec 66: Computer related offenses (Hacking).
- Sec 66C: Identity theft.
- Sec 66D: Cheating by personation using computer.
- Sec 67: Publishing obscene information.
- Digital Signatures: Legal recognition.
"""

with open(os.path.join(pdfs_dir, "03_Major_Indian_Acts_Summary.txt"), "w", encoding="utf-8") as f:
    f.write(acts_content)

print("Knowledge base files created successfully in", pdfs_dir)
