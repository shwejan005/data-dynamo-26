'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const videos = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
];

const Videos = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-black min-h-screen w-full overflow-x-hidden m-0 p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10">
        {videos.map((src, index) => (
          <VideoItem
            key={index}
            src={src}
            direction={index % 2 === 0 ? 'left' : 'right'} // alternate slide directions
          />
        ))}
      </div>
    </div>
  );
};

const VideoItem = ({ src, direction }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -150 : 150,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="flex justify-center"
    >
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-[350px] md:w-[480px] rounded-2xl shadow-lg object-cover"
      />
    </motion.div>
  );
};

export default Videos;