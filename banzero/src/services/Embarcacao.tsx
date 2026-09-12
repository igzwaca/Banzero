import { ref, onValue, OffSubscription } from "firebase/database";
import { db } from "./Firebase";

export interface LocalizacaoBoat {
    id: string;
    latitude: number;
    longitude: number;
    satelites: number;
    velocidade?: number;
    status?: string;
    ultimaAtualizacao?: number;
}

export const monitorarTodasEmbarcacoes = (
    callback: (lista: LocalizacaoBoat[]) => void
): OffSubscription => {
    const frotaRef = ref(db, 'Embarcacoes');

    return onValue(frotaRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            callback([]);
            return;
        }

        const listaBarcos: LocalizacaoBoat[] = Object.entries(data).map(([id, info]: [string, any]) => ({
            id,
            latitude: info.latitude ?? 0,
            longitude: info.longitude ?? 0,
            satelites: info.satelites ?? 0,
            velocidade: info.velocidade ?? 0,
            timestamp: info.timestamp
        }));

        callback(listaBarcos);
    });
};