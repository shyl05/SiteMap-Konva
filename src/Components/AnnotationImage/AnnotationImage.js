import React, { useState, useEffect } from "react";
import { Image } from "react-konva";

const AnnotationImage = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
    };
  }, []);

  return <Image height={640} width={994} image={image} />;
};

export default AnnotationImage;
