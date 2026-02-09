import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

const INTER_FONTS = [
    {
        url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
        fontWeight: 400 as const,
    },
    {
        url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf",
        fontWeight: 600 as const,
    },
    {
        url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
        fontWeight: 700 as const,
    },
];

export async function registerFonts() {
    if (fontsRegistered) return;

    const fonts = await Promise.all(
        INTER_FONTS.map(async ({ url, fontWeight }) => {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            return {
                src: `data:font/ttf;base64,${base64}`,
                fontWeight,
            };
        })
    );

    Font.register({
        family: "Inter",
        fonts,
    });

    fontsRegistered = true;
}
