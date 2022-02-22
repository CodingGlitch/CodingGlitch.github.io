import psutil
import socket
from ANSIUtils import *
import os, platform
import dns.resolver as dns

addresses = psutil.net_if_addrs()
nics = psutil.net_if_stats()


SYSTEM = platform.system()

problems = []

def clearScreen() :
    if SYSTEM == 'Windows' :
        os.system("cls")
    else :
        os.system("clear")

def ping(address) :
    if SYSTEM == 'Windows' :
        if os.system("ping -n 2 "+address) == 0 :
            return True
        else :
            return False
    else :

        if os.system("ping -c 2 "+address+" > /dev/null") == 0 :
            return True
        else :
            return False

def showState(ok) :
    print("[", end = "")
    if ok :
        setFgColor(0, 255, 0)
        print("  OK  ", end = "")
    else :
        setFgColor(255, 0, 0)
        print(" FAIL ", end = "")
    resetTextColor()
    print("]")


def getGateway() :
    if SYSTEM == 'Windows' :
        gateway = os.popen("ifconfig | findstr \"Default Gateway\"")
        gateway = gateway.read().split("\n")
        result = []
        for i in gateway :
            result.append(gateway.split(":")[1])
        return result
    elif SYSTEM == 'Linux' :
        gateway = os.popen("ip route | egrep default | awk {'print $3'}")
        gateway = gateway.read()
        return gateway



clearScreen()

print("Network interfaces : ")
for i in addresses :
    if i == 'lo' :
        continue

    card = addresses[i]
    print(i, ":")
    print("\tState: ", end="")
    print("[", end = "")
    if i in nics :
        if nics[i].isup :
            setFgColor(0, 255, 0)
            print("  UP  ", end = "")
        else :
            setFgColor(255, 0, 0)
            print(" DOWN ", end = "")
    else :
        setFgColor(255, 0, 0)
        print(" DOWN ", end = "")

    resetTextColor()
    print("]")
    for j in range(len(card)) :
        print()
        if card[j].family == psutil.AF_LINK :
            print("\tMAC :\n\t\tAdress:  "+card[j].address)

        if card[j].family == socket.AF_INET :
            print("\tIPv4:\n\t\tAddress: "+card[j].address)
            print("\t\tNetmask: "+card[j].netmask)

        if card[j].family == socket.AF_INET6 :
            print("\tIPv6:\n\t\tAddress: "+card[j].address)
            print("\t\tNetmask: "+card[j].netmask)


print()
print("Default gateway : "+getGateway())
print()

print("DNS Server address : ")
for i in dns.Resolver().nameservers :
    print("\t"+i)

print()
print("DNS Resolution: ")



domainNames = ["www.google.com", "www.cisco.com", "www.netacad.com", "raspberryprojectiut59508273.wordpress.com", "www.amazon.com", "www.facebook.com"]
resolvedDomains = []

for i in domainNames :
    print("\t"+i, end = " "*(20-len(i)))
    try :
        socket.gethostbyname("www.google.com")
        showState(True)
        resolvedDomains.append(True)
    except :
        showState(False)
        resolvedDomains.append(False)
        if not "DNS" in problems :
            problems.append("DNS")


print()
print("Connectivity test : ")
for i in range(len(domainNames)) :
    if resolvedDomains[i] :
        print("\t"+domainNames[i], end = " "*(20-len(domainNames[i])))
        if ping(domainNames[i]) :
            showState(True)
        else :
            showState(False)
            if not "Connectivity" in problems :
                problems.append("Connectivity")
