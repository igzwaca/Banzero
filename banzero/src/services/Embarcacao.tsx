import { ref, onValue, Unsubscribe } from "firebase/database";
import { db } from "./Firebase";

export interface LocalizacaoBoat {
    id: string;
    latitude: number;
    longitude: number;
    satelites: number;
    velocidade?: number;
    status?: string;
    timestamp?: number;
    ultimaAtualizacao?: number;
}

export const monitorarTodasEmbarcacoes = (
    callback: (lista: LocalizacaoBoat[]) => void
): Unsubscribe => {
    const frotaRef = ref(db, 'Embarcacoes');

    return onValue(
        frotaRef,
        (snapshot) => {
            const data = snapshot.val();

            if (!data || typeof data !== 'object') {
                callback([]);
                return;
            }

            // Otimização de performance: laço for..in evita criar dezenas/centenas
            // de tuplas intermediárias em memória geradas pelo Object.entries() a cada tick
            const listaBarcos: LocalizacaoBoat[] = [];

            for (const id in data) {
                if (Object.prototype.hasOwnProperty.call(data, id)) {
                    const info = data[id];
                    if (!info) continue;

                    listaBarcos.push({
                        id,
                        // Garante conversão numérica mesmo se o rastreador enviar strings (ex: "-3.1234")
                        latitude: Number(info.latitude) || 0,
                        longitude: Number(info.longitude) || 0,
                        satelites: Number(info.satelites) || 0,
                        velocidade: Number(info.velocidade) || 0,
                        status: info.status,
                        timestamp: info.timestamp ?? info.ultimaAtualizacao,
                        ultimaAtualizacao: info.ultimaAtualizacao ?? info.timestamp,
                    });
                }
            }

            callback(listaBarcos);
        },
        (error) => {
            console.warn("Erro ao monitorar embarcações:", error);
            callback([]);
        }
    );
};