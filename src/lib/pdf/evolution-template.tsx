import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        fontFamily: "Inter",
        fontSize: 11,
        padding: 40,
        backgroundColor: "#ffffff",
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#7c3aed",
        paddingBottom: 15,
    },
    logo: {
        fontSize: 18,
        fontWeight: 700,
        color: "#7c3aed",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 9,
        color: "#64748b",
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        color: "#1e293b",
        marginTop: 20,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 8,
        gap: 20,
    },
    infoLabel: {
        fontSize: 9,
        color: "#64748b",
        width: 100,
    },
    infoValue: {
        fontSize: 10,
        color: "#1e293b",
        flex: 1,
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: "#7c3aed",
        marginBottom: 8,
    },
    content: {
        fontSize: 10,
        lineHeight: 1.6,
        color: "#334155",
        textAlign: "justify",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: "#94a3b8",
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export interface EvolutionPDFData {
    patientName: string;
    professionalName: string;
    crp: string;
    sessionDate: string;
    sessionType: string;
    evolution: string;
}

export function EvolutionPDF({
    patientName,
    professionalName,
    crp,
    sessionDate,
    sessionType,
    evolution,
}: EvolutionPDFData) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>PSI.CLIN</Text>
                    <Text style={styles.subtitle}>Prontuário Eletrônico Psicológico</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Ficha de Evolução</Text>

                {/* Info */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Paciente:</Text>
                    <Text style={styles.infoValue}>{patientName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Profissional:</Text>
                    <Text style={styles.infoValue}>
                        {professionalName} - CRP {crp}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Data da Sessão:</Text>
                    <Text style={styles.infoValue}>{sessionDate}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tipo:</Text>
                    <Text style={styles.infoValue}>{sessionType}</Text>
                </View>

                {/* Evolution Content */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Evolução</Text>
                    <Text style={styles.content}>{stripHtml(evolution)}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>
                        Documento gerado em {new Date().toLocaleDateString("pt-BR")}
                    </Text>
                    <Text>Confidencial - Sigilo Profissional</Text>
                </View>
            </Page>
        </Document>
    );
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}
