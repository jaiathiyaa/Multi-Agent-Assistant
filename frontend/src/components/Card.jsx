import React from 'react';

function Card({title, description , icon: Icon}){
    return (
        <div className="bg-transparent border border-zinc-500/30 rounded-lg p-6 w-full min-h-55 flex flex-col gap-4 hover:-translate-y-2 hover:bg-gray-900 transition duration-300">
            <div className="bg-linear-to-r from-violet-600 to-purple-500 p-3 rounded-md w-12">
                {Icon && <Icon color="white" size={24} />}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-300">{description}</p>
        </div>
    )
}

export default Card;