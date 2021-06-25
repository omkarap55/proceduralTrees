function generateCylinderVertices(topRadius,bottomRadius,height,radialSegments,heightSegments){
    let cylinderVertices;
    let tempArray = [];
    let currentHeight = height / 2;
    let heightStep = height / heightSegments;
    let radiusStep = (topRadius - bottomRadius) / heightSegments;
    let activeTopRadius = topRadius;
    for (let i = 0; i < heightSegments; i++) {
        
        let activeBottomRadius = activeTopRadius - radiusStep;
        let angleStep = 360 / radialSegments;
        
        for (let angle = 0; angle <= 360; angle = angle + angleStep) {
            let angleRad = angle * Math.PI / 180;
            let angleStepRad = angleStep * Math.PI / 180;
            let currentVertex = [activeTopRadius * Math.cos(angleRad), currentHeight , activeTopRadius * Math.sin(angleRad)];
            tempArray.push(...currentVertex);
            currentVertex = [activeBottomRadius * Math.cos(angleRad), currentHeight - heightStep , activeBottomRadius * Math.sin(angleRad)];
            tempArray.push(...currentVertex);
            currentVertex = [activeBottomRadius * Math.cos(angleRad + angleStepRad), currentHeight - heightStep , activeBottomRadius * Math.sin(angleRad + angleStepRad)];
            tempArray.push(...currentVertex);
            currentVertex = [activeTopRadius * Math.cos(angleRad + angleStepRad), currentHeight , activeTopRadius * Math.sin(angleRad + angleStepRad)];
            tempArray.push(...currentVertex);
        }
        currentHeight -= heightStep;
        activeTopRadius = activeBottomRadius;
    }
    
    cylinderVertices = new Float32Array(tempArray);
    return cylinderVertices;
}
