###ANSI escape codes utility
import colorama
#Use colorama to make this cross compatible with both windows AND linux/mac

colorama.init()

class Color :
    def __init__(self, r = 0, g = 0, b = 0) :
        self.r = r
        self.g = g
        self.b = b

    def negative(self) :
        self.r = 255-self.r
        self.g = 255-self.g
        self.b = 255-self.b



def setFgColor(r, g, b) :
    if type(r) != int or type(g) != int or type(b) != int :
        r = 0
        g = 0
        b = 0
        
    if r < 0 or r > 255 :
        r = 0
    if g < 0 or g > 255 :
        g = 0
    if b < 0 or b > 255 :
        b = 0


    print("\033[38;2;"+str(r)+";"+str(g)+";"+str(b)+"m" , end="")


def setBgColor(r, g, b) :
    if type(r) != int or type(g) != int or type(b) != int :
        r = 0
        g = 0
        b = 0
        
    if r < 0 or r > 255 :
        r = 0
    if g < 0 or g > 255 :
        g = 0
    if b < 0 or b > 255 :
        b = 0


    print("\033[48;2;"+str(r)+";"+str(g)+";"+str(b)+"m" , end="")




def resetTextColor() :
    print("\033[0m", end="")

def setTextMode(bold = False, italic = False, underline = False, invert = False, dim = False, blink = False, strikethrough = False, hidden = False) :
    
    #ESC[21m is some sort of unsupported underline mode
    #It MAY or MAY NOT work on terminals
    #As such, it's not implemented here

    if (not dim) or (not bold) :
        
        print("\033[22m", end = "") #Dim and bold have the same reset ESC sequence.

    if (bold):
        print("\033[1m")
	
    if (dim):
        print("\033[2m")
	

    if (italic):
        print("\033[3m")
    else:
        print("\033[23m")

    if (underline):
        print("\033[4m")
    else:
        print("\033[24m")

    if (blink):
        print("\033[5m")
	
    else:
        print("\033[25m")

    if (inverse):
        print("\033[7m")
	
    else:
        print("\033[27m")

    if (hidden):
        print("\033[8m")
	
    else:
        print("\033[28m")

    if (strikethrough):
        print("\033[9m")
	
    else:
        print("\033[29m")


def gotoXY(x, y) :
    if type(x) != int or type(y) != int :
        x = 0
        y = 1

    if x < 0 :
        x = 0

    if y < 0 :
        y = 0

    print("\033["+str(y)+";"+str(x)+"H", end = "")

def moveCursor(right, down) :
    if type(right) != int :
        right = 0

    if type(down) != int :
        down = 0

    if right < 0 :
        print("\033["+str(-right)+"D", end = "")
    else :
        print("\033["+str(right)+"C", end = "")

    if down < 0 :
        print("\033["+str(-down)+"A", end = "")
    else :
        print("\033["+str(down)+"B", end = "")





