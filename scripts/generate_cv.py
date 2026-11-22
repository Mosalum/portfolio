"""Build MohamedCv.pdf from the editable resume content below.

Run from the repository root with: py -m pip install -r scripts/requirements-cv.txt
Then: py scripts/generate_cv.py
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "MohamedCv.pdf"
NAVY = colors.HexColor("#14213D")
GOLD = colors.HexColor("#C18B12")
INK = colors.HexColor("#202735")
MUTED = colors.HexColor("#566174")
RULE = colors.HexColor("#DCE2EA")


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="Name", fontName="Helvetica-Bold", fontSize=22, leading=25,
        textColor=NAVY, spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="Headline", fontName="Helvetica-Bold", fontSize=10, leading=13,
        textColor=GOLD, spaceAfter=8, uppercase=True,
    ))
    styles.add(ParagraphStyle(
        name="Contact", fontName="Helvetica", fontSize=8.4, leading=11.5,
        textColor=MUTED, spaceAfter=1,
    ))
    styles.add(ParagraphStyle(
        name="SectionTitle", fontName="Helvetica-Bold", fontSize=9.5,
        leading=12, textColor=NAVY, spaceBefore=9, spaceAfter=4,
        keepWithNext=True, borderPadding=(0, 0, 3, 0),
        borderColor=GOLD, borderWidth=0,
    ))
    styles.add(ParagraphStyle(
        name="BodyCV", fontName="Helvetica", fontSize=8.65, leading=11.3,
        textColor=INK, spaceAfter=3.5, alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="BulletCV", parent=styles["BodyCV"], leftIndent=11,
        firstLineIndent=-9, spaceAfter=2.5,
    ))
    styles.add(ParagraphStyle(
        name="Role", fontName="Helvetica-Bold", fontSize=9.1, leading=11,
        textColor=INK, spaceBefore=3, spaceAfter=1, keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="RoleDetail", fontName="Helvetica-Oblique", fontSize=8,
        leading=10, textColor=MUTED, spaceAfter=3, keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="SkillLine", parent=styles["BodyCV"], spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="Footer", fontName="Helvetica", fontSize=7.3, leading=9,
        textColor=MUTED, alignment=TA_LEFT,
    ))
    return styles


class ResumeDoc(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="resume",
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )
        self.addPageTemplates(PageTemplate(id="all", frames=[frame], onPage=self.draw_footer))

    def draw_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.55)
        canvas.line(self.leftMargin, 13 * mm, A4[0] - self.rightMargin, 13 * mm)
        canvas.setFont("Helvetica", 7.2)
        canvas.setFillColor(MUTED)
        canvas.drawString(self.leftMargin, 8.5 * mm, "MOHAMED SALUM MOHAMED | CURRICULUM VITAE")
        canvas.drawRightString(A4[0] - self.rightMargin, 8.5 * mm, f"Page {doc.page}")
        canvas.restoreState()


def heading(text, styles):
    return Paragraph(text.upper(), styles["SectionTitle"])


def bullet(text, styles):
    return Paragraph(f"- {text}", styles["BulletCV"])


def role(company, title, period, styles):
    return [
        Paragraph(company, styles["Role"]),
        Paragraph(f"{title} | {period}", styles["RoleDetail"]),
    ]


def build():
    styles = build_styles()
    doc = ResumeDoc(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=15 * mm,
        bottomMargin=18 * mm,
        title="Mohamed Salum Mohamed - IT Systems Specialist CV",
        author="Mohamed Salum Mohamed",
        subject="IT support, systems administration, software, networking and graphic design",
    )
    story = [
        Paragraph("MOHAMED SALUM MOHAMED", styles["Name"]),
        Paragraph("GENERAL IT PROFESSIONAL | IT SYSTEMS SPECIALIST | GRAPHIC DESIGNER", styles["Headline"]),
        Paragraph(
            'Tanzania &nbsp;|&nbsp; +255 678 635 302 &nbsp;|&nbsp; '
            '<link href="mailto:moitofficer@gmail.com" color="#566174">moitofficer@gmail.com</link>'
            ' &nbsp;|&nbsp; Date of Birth: 24 June 2000',
            styles["Contact"],
        ),
        Paragraph(
            '<link href="https://mosalum.github.io/portfolio/" color="#566174">'
            'mosalum.github.io/portfolio</link> &nbsp;|&nbsp; '
            '<link href="https://github.com/Mosalum" color="#566174">github.com/Mosalum</link>',
            styles["Contact"],
        ),
        Spacer(1, 5),
        heading("Professional Profile", styles),
        Paragraph(
            "Versatile IT professional with a Bachelor of Science in Information System Management "
            "from Ardhi University and practical experience across IT support, systems administration, "
            "computer repair, network infrastructure, software development and graphic design. Currently "
            "serving as IT Officer and Assistant Supervisor at KaribuNet Ltd, with part-time computer "
            "maintenance work at DANTAN TRADER and independent design and printing services. Combines "
            "hands-on troubleshooting, technical coordination and clear communication to deliver reliable "
            "technology and visual solutions.",
            styles["BodyCV"],
        ),
        heading("Core Competencies", styles),
        Paragraph(
            "IT support and systems administration | Computer hardware diagnostics and repair | "
            "LAN, Wi-Fi and connectivity | Preventive maintenance and incident follow-up | "
            "Web application development and databases | Corporate branding and print production | "
            "Technical reporting and user guidance",
            styles["BodyCV"],
        ),
        heading("Professional Experience", styles),
    ]

    story.extend(role(
        "KARIBUNET LTD",
        "IT Officer / Assistant Supervisor - IT Support Department",
        "2026 - Present | Full-time",
        styles,
    ))
    story.extend([
        bullet("Provide technical support and preventive and corrective maintenance across multiple hospital facilities.", styles),
        bullet("Coordinate IT support activities and technical personnel; guide users and support staff training.", styles),
        bullet("Monitor computers, servers, LAN and Wi-Fi, routers, switches, internet connectivity, printers, CCTV and IP telephony.", styles),
        bullet("Troubleshoot hardware, software, network and system issues, including support for hospital platforms such as SHAMS.", styles),
        bullet("Follow up incidents, tickets and escalations; prepare technical, maintenance and operational reports.", styles),
        bullet("Identify infrastructure weaknesses and recommend practical service improvements.", styles),
    ])
    story.extend(role(
        "DANTAN TRADER",
        "Computer Hardware & Software Maintenance Technician",
        "2023 - Present | Part-time",
        styles,
    ))
    story.extend([
        bullet("Inspect imported computers before deployment or resale, identifying component faults and performance issues.", styles),
        bullet("Repair, service, refurbish and upgrade desktop and laptop computers; test memory, processors, storage, displays, keyboards and batteries.", styles),
        bullet("Install and configure Windows and Linux operating systems, drivers, utilities and essential applications.", styles),
        bullet("Diagnose boot failures, operating system errors, storage faults, driver conflicts and software problems.", styles),
        bullet("Perform preventive maintenance, system optimization and post-repair quality checks; recommend needed repairs or upgrades.", styles),
    ])

    story.append(PageBreak())
    story.append(heading("Additional Experience", styles))
    story.extend(role(
        "FREELANCE GRAPHIC DESIGN & PRINTING",
        "Graphic Designer | Branding & Printing Specialist",
        "2022 - Present | Self-employed",
        styles,
    ))
    story.extend([
        bullet("Create corporate branding, marketing and event materials, including banners, posters, stickers, business cards and product labels.", styles),
        bullet("Deliver design-to-print services: prepare production-ready artwork with suitable dimensions, resolution and specifications.", styles),
        bullet("Develop visual identities and shop, office and promotional materials to client requirements; manage revisions and consistency.", styles),
        Paragraph(
            "Selected clients and projects: IKUPA FINANCE (corporate and event branding); TTCL (ceremony and event graphics); "
            "KIZINGO ELECTRONICS (business and shop branding); mobile money agents; transport and logistics offices.",
            styles["BodyCV"],
        ),
    ])
    story.extend(role(
        "HUBNET / HUB-NETWORKS",
        "IT Support Intern",
        "September 2022 - December 2022",
        styles,
    ))
    story.extend([
        bullet("Assisted with hardware and software troubleshooting, network installation and IT infrastructure maintenance.", styles),
        bullet("Supported server administration and monitoring, user requests and payment system operations.", styles),
    ])

    story.extend([
        heading("Education", styles),
        Paragraph("ARDHI UNIVERSITY - Bachelor of Science in Information System Management | 2020 - 2023", styles["BodyCV"]),
        Paragraph("KAGANGO SECONDARY SCHOOL - Advanced Certificate of Secondary Education (A-Level) | 2018 - 2020", styles["BodyCV"]),
        Paragraph("KAMENE SECONDARY SCHOOL - Certificate of Secondary Education (O-Level) | 2014 - 2017", styles["BodyCV"]),
        heading("Technical Skills", styles),
        Paragraph("<b>IT Support:</b> Hardware diagnostics and repair, software troubleshooting, operating system installation, preventive maintenance.", styles["SkillLine"]),
        Paragraph("<b>Systems:</b> Windows, Linux/Ubuntu, server administration and deployment.", styles["SkillLine"]),
        Paragraph("<b>Networking:</b> MikroTik, LAN/WAN, DHCP, DNS, IP addressing, subnetting and Wi-Fi hotspot management.", styles["SkillLine"]),
        Paragraph("<b>Development:</b> PHP Native, Laravel, MySQL, HTML, CSS, JavaScript and API integration.", styles["SkillLine"]),
        Paragraph("<b>Design and Print:</b> Corporate branding, banners, stickers, labels, business cards, posters and print production.", styles["SkillLine"]),
        Paragraph("<b>Security and Operations:</b> CCTV, NVR/DVR, IP cameras, IP telephony, incident management, technical reporting and coordination.", styles["SkillLine"]),
        heading("Selected Projects", styles),
        bullet("Wapambanaji VICOBA Management System - savings group member records, contributions and loan management.", styles),
        bullet("Wi-Fi Voucher Services - hotspot access and voucher management.", styles),
        bullet("Vehicle Ledger Management System - vehicle records and operational management.", styles),
        bullet("Bus Ticketing and Booking System - web-based passenger booking and ticket management.", styles),
        heading("Languages and Additional Information", styles),
        Paragraph("Kiswahili - Fluent | English - Professional working proficiency | Professional references available upon request.", styles["BodyCV"]),
        Paragraph("Declaration: I declare that the information provided is true and accurate to the best of my knowledge and belief.", styles["BodyCV"]),
        Paragraph("MOHAMED SALUM MOHAMED", styles["Role"]),
    ])
    doc.build(story)
    print(f"Created {OUTPUT}")


if __name__ == "__main__":
    build()
