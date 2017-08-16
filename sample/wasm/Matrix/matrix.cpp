#include <iostream>
#include <math.h>

#include "matrix.h"

Matrix::Matrix()
{
    strValue = "";
    degreeValue = 0.0;

    cx = 0.0;
    cy = 0.0;

    dX = 0.0;
    dY = 0.0;
    dZ = 0.0;

    scaleWidth = 1.0;
    scaleHeight = 1.0;
}

char* Matrix::ToString()
{
    float values[16] = {1.0, 0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.0, 0.0, 0.0, 1.0};

    // scale
    values[0] *= scaleWidth;
    values[5] *= scaleHeight;

    // rotate X
    if (dX != 0) {
        float t[16] = {1.0, 0.0, 0.0, 0.0,
                       0.0, 1.0, 0.0, 0.0,
                       0.0, 0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0, 1.0};
        t[5] = cos(dX);
        t[6] = (sin(dX) * (-1));
        t[9] = sin(dX);
        t[10] = cos(dX);
        multiply(values, t);
    }

    // rotate Y
    if (dY != 0) {
        float t[16] = {1.0, 0.0, 0.0, 0.0,
                       0.0, 1.0, 0.0, 0.0,
                       0.0, 0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0, 1.0};
        t[0] = cos(dY);
        t[2] = sin(dY);
        t[8] = (sin(dY) * (-1));
        t[10] = cos(dY);
        multiply(values, t);
    }

    // rotate Z
    if (dZ != 0) {
        float t[16] = {1.0, 0.0, 0.0, 0.0,
                       0.0, 1.0, 0.0, 0.0,
                       0.0, 0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0, 1.0};
        t[0] = cos(dZ);
        t[1] = (sin(dZ) * (-1));
        t[4] = sin(dZ);
        t[5] = cos(dZ);
        multiply(values, t);
    }

    // move
    values[12] += cx;
    values[13] += cy;

    strValue = "";
    for (int i = 0; i < 16; i++) {
        strValue += std::to_string(values[i]);
        if (i != 15)
            strValue += ", ";
    }
    return const_cast<char*>(strValue.c_str());
}

void Matrix::move(float x, float y)
{
    cx += x;
    cy += y;
}

void Matrix::moveTo(float x, float y)
{
    cx = x;
    cy = y;
}

void Matrix::scale(float width, float height)
{
    scaleWidth *= width;
    scaleHeight *= height;
}

void Matrix::scaleTo(float width, float height)
{
    scaleWidth = width;
    scaleHeight = height;
}

void Matrix::rotateZ(float degree)
{
    dZ += degree;
}

void Matrix::rotateX(float degree)
{
    dX += degree;
}

void Matrix::rotateY(float degree)
{
    dY += degree;
}

void Matrix::multiply(float* lVal, float* rVal)
{
    float t[16];

    for (int x = 0; x < 4; x++) {
        for (int y = 0; y < 4; y++) {
            t[4*x+y] = 0;
            for (int z = 0; z < 4; z++) {
                t[4*x+y] += lVal[4*x+z] * rVal[4*z+y];
            }
        }
    }

    for (int i = 0; i < 16; i++)
        lVal[i] = t[i];
}

int main(int argc, char** argv)
{
    Matrix* m = new Matrix();
    std::cout << m->ToString() << std::endl;
    m->move(10, 10);
    std::cout << m->ToString() << std::endl;
}
