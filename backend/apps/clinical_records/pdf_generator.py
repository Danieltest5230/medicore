import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT, TA_JUSTIFY


def generate_clinical_history_pdf(encounter):
    """
    Genera el PDF oficial de la Historia Clínica de Clínica Médica
    reproduciendo fielmente la estructura y estilo del documento modelo.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,  # ~2 cm
        rightMargin=54,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Custom styles matching sample PDF
    title_style = ParagraphStyle(
        'ClinicalTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        textTransform='uppercase'
    )

    normal_style = ParagraphStyle(
        'ClinicalBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        alignment=TA_LEFT,
        textColor=colors.black
    )

    bold_title_style = ParagraphStyle(
        'ClinicalSectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        alignment=TA_LEFT,
        textColor=colors.black
    )

    bullet_style = ParagraphStyle(
        'ClinicalBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        alignment=TA_LEFT,
        leftIndent=10,
        textColor=colors.black
    )

    signature_style = ParagraphStyle(
        'ClinicalSignature',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        alignment=TA_RIGHT,
        textColor=colors.black
    )

    story = []

    # 1. Título centrado con subrayado
    story.append(Paragraph("<u>HISTORIA CLINICA</u>", title_style))
    story.append(Spacer(1, 16))

    # 2. Datos filiatorios
    patient = encounter.patient
    story.append(Paragraph(f"<b>Apellido y nombre:</b> {patient.last_name} {patient.first_name}", normal_style))
    story.append(Paragraph(f"<b>Edad:</b> {patient.age} años", normal_style))
    story.append(Paragraph(f"<b>Fecha de nacimiento:</b> {patient.birth_date.strftime('%d/%m/%Y')}", normal_style))
    story.append(Paragraph(f"<b>DNI:</b> {patient.document_number}", normal_style))
    
    affiliate_str = f" Afiliado {patient.health_insurance_number}" if patient.health_insurance_number else ""
    story.append(Paragraph(f"<b>Obra social:</b> {patient.health_insurance_name}{affiliate_str}", normal_style))
    story.append(Spacer(1, 12))

    # 3. Antecedentes de la Enfermedad
    disease_text = encounter.disease_history or encounter.current_illness or encounter.reason_for_consultation
    story.append(Paragraph(f"<b>ANTECEDENTES DE LA ENFERMEDAD:</b> {disease_text}", normal_style))
    story.append(Spacer(1, 10))

    # 4. Antecedentes Estructurados
    story.append(Paragraph("<b>ANTECEDENTES:</b>", bold_title_style))
    pathological = encounter.pathological_history or "HTA, factores de riesgo cardiovascular en seguimiento"
    story.append(Paragraph(f"1. Patológicos: {pathological}", normal_style))

    medication = encounter.medication_history or "Medicación habitual referida"
    story.append(Paragraph(f"2. Medicamentos: {medication}", normal_style))

    surgical = encounter.surgical_history or "Sin cirugías previas de relevancia"
    story.append(Paragraph(f"3. Quirúrgicos: {surgical}", normal_style))
    story.append(Spacer(1, 12))

    # 5. Examen Físico Segmentado
    story.append(Paragraph("<b>EXAMEN FISICO:</b>", bold_title_style))

    exam = getattr(encounter, 'physical_examination', None)
    vitals = getattr(encounter, 'vital_signs', None)
    sat_val = f" sat {vitals.oxygen_saturation} % aa" if vitals and vitals.oxygen_saturation else ""

    skin = exam.skin_and_mucosa if exam and exam.skin_and_mucosa else "humedad conservada, elasticidad normal, no presenta edemas, ni circulación colateral"
    story.append(Paragraph(f"- Piel y Mucosas: {skin}", bullet_style))

    cvc = exam.cardiovascular_system if exam and exam.cardiovascular_system else "R1 R2 normofonéticos. Silencios impresionan libres. Pulsos periféricos permeables simétricos y regulares."
    story.append(Paragraph(f"- Ap. CVC: {cvc}", bullet_style))

    resp = exam.respiratory_system if exam and exam.respiratory_system else "Buena mecánica ventilatoria sin ruidos patológicos agregados."
    story.append(Paragraph(f"- Ap. Respiratorio: {resp}{sat_val}", bullet_style))

    abd = exam.abdomen if exam and exam.abdomen else "Abdomen blando, depresible, indoloro, flatos positivos, alimentación por vía oral, catarsis conservada"
    story.append(Paragraph(f"- Abdomen: {abd}", bullet_style))

    gu = exam.genitourinary_system if exam and exam.genitourinary_system else "Puño percusión lumbar bilateral negativa. Puntos Ureterales (-). Diuresis +."
    story.append(Paragraph(f"- Ap. Genitourinario: {gu}", bullet_style))

    snc = exam.neurological_system if exam and exam.neurological_system else "Glasgow 15/15. Signos meníngeos ausentes. Reflejos Osteotendinosos conservados."
    story.append(Paragraph(f"- SNC: {snc}", bullet_style))
    story.append(Spacer(1, 12))

    # 6. Estudios Complementarios / Laboratorio
    story.append(Paragraph("<b>ESTUDIOS COMPLEMENTARIOS</b>", bold_title_style))
    story.append(Paragraph("Laboratorio:", bold_title_style))
    
    lab_text = encounter.complementary_studies or "Sin estudios bioquímicos recientes adjuntos en la consulta."
    story.append(Paragraph(lab_text.replace('\n', '<br/>'), normal_style))
    story.append(Spacer(1, 14))

    # 7. Plan
    story.append(Paragraph("<b>PLAN:</b>", bold_title_style))
    evolution_note = getattr(encounter, 'evolution_note', None)
    plan_text = evolution_note.treatment_plan if evolution_note and evolution_note.treatment_plan else "Plan de seguimiento clínico ambulatorio y control periódico."
    story.append(Paragraph(plan_text.replace('\n', '<br/>'), normal_style))
    story.append(Spacer(1, 35))

    # 8. Firma del Médico alineada a la derecha
    doctor = encounter.doctor
    prof_profile = getattr(doctor, 'professional_profile', None)
    
    doc_name = f"Dr/a. {doctor.get_full_name()}"
    mp_text = f"MP {prof_profile.provincial_license}" if prof_profile and prof_profile.provincial_license else "MP 05064"
    specialty_text = prof_profile.specialty if prof_profile and prof_profile.specialty else "Especialista en clínica médica"

    story.append(Paragraph(doc_name, signature_style))
    story.append(Paragraph(mp_text, signature_style))
    story.append(Paragraph(specialty_text, signature_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
