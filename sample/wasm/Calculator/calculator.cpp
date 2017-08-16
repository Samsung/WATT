#include <iostream>

#include "calculator.h"

using namespace std;

const char* Calculator::supportOperators[] = 
{
    "+"
    , "-"
    , "*"
    , "/"
};

Calculator::Calculator(int initialValue)
    : currentValue(initialValue)
    , state(Operand)
    , currentOp(NotSupport)
{
    cout << "[DEBUG] Calculator is created with " << initialValue << "." << endl;
}

bool Calculator::setOperand(int value)
{
    if (state == Operand)
        return false;

    cout << "[DEBUG] " << __func__ << " >> value: " << value << endl;
    state = Operand;
    
    switch (currentOp) {
    case Plus:
        cout << "[DEBUG] " << __func__ << " >> PLUS" << endl;
        currentValue += value;
        break;
    case Minus:
        cout << "[DEBUG] " << __func__ << " >> MINUS" << endl;
        currentValue -= value;
        break;
    case Multiply:
        cout << "[DEBUG] " << __func__ << " >> MULTIPLY" << endl;
        currentValue *= value;
        break;
    case Divide:
        cout << "[DEBUG] " << __func__ << " >> DIVIDE" << endl;
        currentValue /= value;
        break;
    default:
        cout << "[Error] Could not reach." << endl;
    }
    cout << "[DEBUG] " << __func__ << " >> currentValue : " << currentValue << endl;
    return true;
}

bool Calculator::setOperator(std::string op)
{
    if (state == Operator)
        return false;

    cout << "[DEBUG] " << __func__ << ": " << op << endl;

    if (op.compare(supportOperators[0]) == 0)
        currentOp = Plus;
    else if (op.compare(supportOperators[1]) == 0)
        currentOp = Minus;
    else if (op.compare(supportOperators[2]) == 0)
        currentOp = Multiply;
    else if (op.compare(supportOperators[3]) == 0)
        currentOp = Divide;
    else {
        currentOp = NotSupport;
        return false;
    }

    state = Operator;
    return true;
}

int Calculator::getResult()
{
    return currentValue;
}

Calculator::OPERATOR Calculator::getOperatorEnum(std::string op)
{
    cout << "[DEBUG] " << __func__ << ": supportOperators[0] " << supportOperators[0] << endl;
    if (op.compare(supportOperators[0]))
        return Plus;
    cout << "[DEBUG] " << __func__ << ": supportOperators[1] " << supportOperators[1] << endl;
    if (op.compare(supportOperators[1]))
        return Minus;
    cout << "[DEBUG] " << __func__ << ": supportOperators[2] " << supportOperators[2] << endl;
    if (op.compare(supportOperators[2]))
        return Multiply;
    cout << "[DEBUG] " << __func__ << ": supportOperators[3] " << supportOperators[3] << endl;
    if (op.compare(supportOperators[3]))
        return Divide;

    return NotSupport;
}

int main()
{
    Calculator c(3);
    c.setOperator("+");
    c.setOperand(3);
    cout << c.getResult() << endl;

    c.setOperator("*");
    c.setOperand(3);
    cout << c.getResult() << endl;

    c.setOperator("-");
    c.setOperand(3);
    cout << c.getResult() << endl;

    c.setOperator("/");
    c.setOperand(3);
    cout << c.getResult() << endl;

    return 0;
}
