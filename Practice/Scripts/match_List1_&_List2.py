list_1 = [57424, 54060, 44870, 41493, 80409, 56010, 44306, 72892, 62206, 60172, 60591, 59996, 59264, 59429, 59427, 58243, 58242, 57733, 57667, 58244, 57111, 56009, 55576, 55997, 55463, 53581, 54266, 52486, 75186, 51537, 50961, 49419, 49417, 44090, 58245, 61070, 54872, 61692, 60574, 61687, 61072, 59948, 60565, 58776, 58761, 59383, 58240, 56584, 57619, 54695, 55389, 54871, 53321, 53757, 52124, 70990, 51523, 50445, 49889, 49414, 46239, 46400, 44092]

list_2 = [59948, 58242, 55463, 57667, 52124, 62206, 61687, 54872, 72892, 54060, 70990, 51537, 49417, 44090, 60172, 50445, 57733, 46400, 59429, 49419, 60574, 51537, 49417, 44090, 60172, 50445, 57733, 46400, 59429, 49419, 54695, 49889, 80409, 58242, 55463, 57667, 52124, 62206, 61687, 54872, 72892, 54060, 60565, 49414, 54266, 46239, 52486, 56584, 59948, 53581, 50961, 75186, 61070, 53757, 44306, 59383, 51523, 55576, 55389, 58245, 59996, 44092, 56009]

# Check if each item in list_1 is present in list_2
present = all(item in list_2 for item in list_1)

if present:
    print("All items in list_1 are present in list_2.")
else:
    # Find the items in list_1 that are not present in list_2
    not_present_in_list_2 = [item for item in list_1 if item not in list_2]
    not_present_in_list_2.sort()
    
    # Find the items in list_2 that are not present in list_1
    not_present_in_list_1 = [item for item in list_2 if item not in list_1]
    not_present_in_list_1.sort()
    
    print("Items not present in list_2:", not_present_in_list_2)
    print("Items not present in list_1:", not_present_in_list_1)
    
