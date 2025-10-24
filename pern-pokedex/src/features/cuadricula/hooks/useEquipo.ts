import { useMutation, useQuery } from "@tanstack/react-query";
import type { Pokemon } from "../interfaces/Pokemon.interface";
import api from "../../../shered/utils/api";
import { useState } from "react";
 
const useEquipo = () => { 
    
    const query = useQuery({
        queryKey: ["equipo"],
        queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const response = await api.get<Pokemon[]>("usuario/equipo" );
        return response.data;
        },
    });

    const agregar =  useMutation({
        mutationFn: async () => {
            const response = await api.post('equipo', equipo.map(a=>({pokemonId:a})))
            return response.data;
        }
    })  


    const toggleEquipo = (pokemon:Pokemon)=>{
        if(equipo.some(a => a.id === pokemon.id)){
            setEqipo((a)=>[
                ...a, pokemon
            ])
        }else{
            setEqipo(a=>a.filter(p=>p.id !== pokemon.id))
        }

    }

    
    const [equipo, setEqipo] = useState<Pokemon[]>([])

   
    return {data: query.data, equipo, agregar, toggleEquipo}
}

export default useEquipo;