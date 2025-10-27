import { Flex, Space, Text } from "@mantine/core"
import { useEquipoStore } from "../../layout/store/equipoStore"
import ButtonCustom from "../../layout/components/ButtonCustom";
import CardPokemon from "../../cuadricula/components/CardPokemon";
import {DragDropContext, Draggable, Droppable, type DropResult} from "@hello-pangea/dnd"
import { useMutation } from "@tanstack/react-query";
import { set } from "zod";


export default function ListaEquipo() {

const {equipoDraft,resetDraft,setDraft, deletePokemon} = useEquipoStore()

/*const {mutate} = useMutation()*/

const  onDragEnd = async ({destination,source}: DropResult<string>) =>{

    if (!destination){
        deletePokemon(equipoDraft[source.index].id)
        return
    }

    const fromIndex = source.index
    const toIndex= destination.index

    const equipoClonado = [...equipoDraft]
    const [pokemonMovido] = equipoClonado.splice(fromIndex,1)
    equipoClonado.splice(toIndex,0,pokemonMovido)
    setDraft(equipoClonado)
}

  return (
    <>
    <Flex align={'center'} justify={'center'} gap={'md'}>
        <Text
            c={'var(--color-warning-500)'}
            size='2rem'
            fw={700}
            p={6}
            styles={{
                root:{
                    borderWidth:2,
                }
            }}           
        >
            Mi equipo
        </Text>
        <div className='text-2xl text-white font-bold'>
            {equipoDraft.length}/6
        </div>
    </Flex>
    <Space h={'lg'}/>
    <Flex align={'center'} justify={'center'}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="dnd-list" direction="horizontal">
                    {
                        (provide) =>(
                            <div
                            className="flex gap-2 p-10 bg-red-100 place-content-center rounded-3xl"
                            ref={provide.innerRef}
                            {...provide.droppableProps}
                            >
                            {
                                equipoDraft.map((pokemon,index) =>(
                                    <Draggable
                                    key={pokemon.id}
                                    index={index}
                                    draggableId={pokemon.id.toString()}
                                    >
                                        {
                                            (provided) =>{
                                                {
     return (
                                                <div
                                                ref={provided.innerRef}
                                                {...provided.dragHandleProps}
                                                {...provided.draggableProps}
                                                >
                                                    <CardPokemon pokemon={pokemon} selected={false}/>

                                                </div>)


                                                }
                                             
                                            }
                                          

                                        }

                                    </Draggable>

                                ))
                            }

                            </div>
                        )

                    }

                </Droppable>
            </DragDropContext>

    </Flex>
    <Space h={20}/>
     <Flex justify={'center'} gap={'md'}>
        <ButtonCustom
        label='Limpiar'
        color='secondary'
        disabled = {equipoDraft.length ===0}
        onClick={()=> resetDraft()}
        >
        </ButtonCustom>
               <ButtonCustom
        label='Guardar'
        color='primary'
        /*  onClick={
            ()=> 
            mutate(equipoDraft.map(pokemon => pokemon.id),{
                onSuccess:() => {
                    setIsSuccess(true)
                }



            })}*/
        >
        </ButtonCustom>
     </Flex>
    </>
  )
}
