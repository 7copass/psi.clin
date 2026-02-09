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
        marginBottom: 5,
    },
    period: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 15,
    },
    section: {
        marginTop: 18,
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
    listItem: {
        fontSize: 10,
        lineHeight: 1.6,
        color: "#334155",
        marginBottom: 4,
        paddingLeft: 10,
    },
    interventionBox: {
        backgroundColor: "#f8fafc",
        padding: 8,
        marginBottom: 6,
        borderRadius: 4,
    },
    interventionTitle: {
        fontSize: 10,
        fontWeight: 600,
        color: "#1e293b",
        marginBottom: 2,
    },
    interventionResult: {
        fontSize: 9,
        color: "#64748b",
    },
    quote: {
        fontSize: 10,
        fontStyle: "italic",
        color: "#475569",
        borderLeftWidth: 2,
        borderLeftColor: "#7c3aed",
        paddingLeft: 8,
        marginBottom: 6,
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

export interface EvolucaoConsolidadaPDFData {
    patientName: string;
    periodoInicio: string;
    periodoFim: string;
    sessionsCount: number;
    content: {
        observacoes_iniciais: string;
        evolucao_emocional_comportamental: string;
        pontos_chave: string[];
        principais_intervencoes: Array<{
            intervencao: string;
            resultado: string;
        }>;
        citacoes_relevantes: string[];
    };
}

export function EvolucaoConsolidadaPDF({
    patientName,
    periodoInicio,
    periodoFim,
    sessionsCount,
    content,
}: EvolucaoConsolidadaPDFData) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>PSI.CLIN</Text>
                    <Text style={styles.subtitle}>
                        Prontuario Eletronico Psicologico
                    </Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>
                    Evolucao Consolidada — {patientName}
                </Text>
                <Text style={styles.period}>
                    Periodo: {periodoInicio} — {periodoFim} | {sessionsCount}{" "}
                    {sessionsCount === 1 ? "sessao" : "sessoes"} analisadas
                </Text>

                {/* Observacoes Iniciais */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Observacoes Iniciais
                    </Text>
                    <Text style={styles.content}>
                        {content.observacoes_iniciais || "Nao informado"}
                    </Text>
                </View>

                {/* Evolucao Emocional */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Evolucao Emocional e Comportamental
                    </Text>
                    <Text style={styles.content}>
                        {content.evolucao_emocional_comportamental || "Nao informado"}
                    </Text>
                </View>

                {/* Pontos-chave */}
                {content.pontos_chave?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Pontos-Chave das Sessoes
                        </Text>
                        {content.pontos_chave.map((ponto, i) => (
                            <Text key={i} style={styles.listItem}>
                                • {ponto}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Intervencoes */}
                {content.principais_intervencoes?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Principais Intervencoes
                        </Text>
                        {content.principais_intervencoes.map((item, i) => (
                            <View key={i} style={styles.interventionBox}>
                                <Text style={styles.interventionTitle}>
                                    {item.intervencao}
                                </Text>
                                <Text style={styles.interventionResult}>
                                    Resultado: {item.resultado}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Citacoes */}
                {content.citacoes_relevantes?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Citacoes Relevantes
                        </Text>
                        {content.citacoes_relevantes.map((citacao, i) => (
                            <Text key={i} style={styles.quote}>
                                &quot;{citacao}&quot;
                            </Text>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>
                        Documento gerado em{" "}
                        {new Date().toLocaleDateString("pt-BR")}
                    </Text>
                    <Text>Confidencial — Sigilo Profissional</Text>
                </View>
            </Page>
        </Document>
    );
}
