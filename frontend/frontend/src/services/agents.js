import api from "./axios";
export const addAgent=async(postdata)=>{
    try{
        const response=await api.post("/agents",postdata);
        return response.data;
    }catch(error){
        console.log("Error adding agent:",error);
    }
}