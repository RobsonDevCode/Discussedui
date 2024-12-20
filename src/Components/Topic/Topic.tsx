import { useState, useEffect } from 'react'
import { Topic } from '../../models/Topic';
import { fetchTopic } from '../../Sevices/TopicClient'


const DisplayTopic = () =>{
    const [topic, setTopic] = useState<Topic>();
    useEffect(() => {
      const loadTopic = async () => {
        try{
            const data = await fetchTopic();
            console.log("returning:" + data);
            setTopic(data);
        }catch(err){
          console.error(err);
        }
      };
      
      loadTopic();
    }, []);
    
    return (
        <div>
            <h1>
                {topic?.name}
            </h1>
        </div>
    );
} 

export default DisplayTopic;