import React from 'react';
import { LIFESTYLE_IMAGES } from '../../constants/mockData';

const Lifestyle = () => {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-white">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-space-grotesk font-black text-headline-xl text-zinc-900 leading-none mb-2 uppercase">Lifestyle</h2>
          <p className="text-body-lg text-secondary">Engineered for the track, designed for the street.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-gutter h-auto md:h-[800px]">
          {LIFESTYLE_IMAGES.map((item, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-lg overflow-hidden group ${item.colSpan} ${item.rowSpan} min-h-[300px]`}
            >
              <img 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src={item.url} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 md:p-10 transition-opacity group-hover:opacity-100">
                {item.subtitle && (
                  <span className="text-white/80 font-bold tracking-widest text-label-sm uppercase mb-2">
                    {item.subtitle}
                  </span>
                )}
                <h3 className={`text-white ${item.rowSpan ? 'font-headline-lg' : 'font-headline-md'}`}>
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Lifestyle;
