import { useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import styled from "styled-components";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  portions: number;
  originalPortions: number;
  image?: string;
}

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const RecipeCard = styled(Card)`
  && {
    margin: 1rem 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    transition: transform 0.2s;
    &:hover {
      transform: translateY(-5px);
    }
  }
`;

const StyledButton = styled(Button)`
  && {
    margin: 1rem 0;
    background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
    color: white;
    &:hover {
      background: linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%);
    }
  }
`;

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

interface RecipeFormData {
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  portions: number;
  image?: string;
}

const initialFormData: RecipeFormData = {
  name: "",
  ingredients: [{ name: "", amount: 0, unit: "" }],
  instructions: "",
  portions: 4,
};

const App = () => {
  const [recipes, setRecipes] = useLocalStorageState<Recipe[]>("recipes", {
    defaultValue: [
      {
        id: 1,
        name: "Спагетти Карбонара",
        ingredients: [
          { name: "Спагетти", amount: 400, unit: "г" },
          { name: "Бекон", amount: 200, unit: "г" },
          { name: "Яйца", amount: 4, unit: "шт" },
          { name: "Пармезан", amount: 100, unit: "г" },
        ],
        instructions: "1. Отварить пасту\n2. Обжарить бекон\n3. Смешать яйца с сыром\n4. Соединить все ингредиенты",
        portions: 4,
        originalPortions: 4
      },
      {
        id: 2,
        name: "Борщ",
        ingredients: [
          { name: "Говядина", amount: 500, unit: "г" },
          { name: "Свекла", amount: 300, unit: "г" },
          { name: "Капуста", amount: 400, unit: "г" },
          { name: "Картофель", amount: 400, unit: "г" },
        ],
        instructions: "1. Сварить бульон\n2. Добавить овощи\n3. Варить до готовности",
        portions: 6,
        originalPortions: 6
      },
      // ... добавьте еще 3 рецепта по аналогии
    ],
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<RecipeFormData>>({});

  const handlePortionsChange = (recipe: Recipe, newPortions: number) => {
    setRecipes(recipes.map(r => {
      if (r.id === recipe.id) {
        const ratio = newPortions / r.originalPortions;
        const updatedIngredients = r.ingredients.map(ing => ({
          ...ing,
          amount: Number((ing.amount * ratio).toFixed(1))
        }));
        return { ...r, portions: newPortions, ingredients: updatedIngredients };
      }
      return r;
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<RecipeFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Название рецепта обязательно";
    }
    if (formData.ingredients.some(ing => !ing.name || ing.amount <= 0 || !ing.unit)) {
      errors.ingredients = [] as Ingredient[];
      formData.ingredients.forEach(ing => {
        if (!ing.name || ing.amount <= 0 || !ing.unit) {
          errors.ingredients?.push(ing);
        }
      });
    }
    if (!formData.instructions.trim()) {
      errors.instructions = "Инструкции обязательны";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRecipe = () => {
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      ingredients: [...recipe.ingredients],
      instructions: recipe.instructions,
      portions: recipe.portions,
      image: recipe.image,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRecipe = (id: number) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const handleSaveRecipe = () => {
    if (!validateForm()) return;

    if (editingRecipe) {
      setRecipes(recipes.map(recipe =>
        recipe.id === editingRecipe.id
          ? {
              ...recipe,
              ...formData,
              originalPortions: formData.portions,
            }
          : recipe
      ));
    } else {
      setRecipes([
        ...recipes,
        {
          id: Date.now(),
          ...formData,
          originalPortions: formData.portions,
        },
      ]);
    }

    setIsDialogOpen(false);
    setEditingRecipe(null);
    setFormData(initialFormData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppContainer>
      <Typography variant="h3" component="h1" gutterBottom 
        sx={{ color: '#2c3e50', textAlign: 'center', fontWeight: 'bold' }}>
        <RestaurantIcon sx={{ fontSize: 40, marginRight: 2 }} />
        Книга рецептов
      </Typography>

      <StyledButton
        variant="contained"
        fullWidth
        startIcon={<AddIcon />}
        onClick={handleAddRecipe}
      >
        Добавить рецепт
      </StyledButton>

      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id}>
          <CardContent>
            <Typography variant="h5" component="h2">
              {recipe.name}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                Порции: {recipe.portions}
              </Typography>
              <Slider
                value={recipe.portions}
                min={1}
                max={12}
                onChange={(_, value) => handlePortionsChange(recipe, value as number)}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            <List>
              {recipe.ingredients.map((ing, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${ing.name}: ${ing.amount} ${ing.unit}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions>
            <IconButton onClick={() => handleEditRecipe(recipe)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteRecipe(recipe.id)}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </RecipeCard>
      ))}

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRecipe ? "Редактировать рецепт" : "Новый рецепт"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl error={!!formErrors.name}>
              <InputLabel>Название рецепта</InputLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
              {formErrors.name && (
                <FormHelperText>{formErrors.name}</FormHelperText>
              )}
            </FormControl>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ингредиенты
              </Typography>
              {formData.ingredients.map((ing, index) => (
                <Stack key={index} direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Название"
                    value={ing.name}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        ingredients: newIngredients
                      }));
                    }}
                  />
                  <TextField
                    label="Количество"
                    type="number"
                    value={ing.amount}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].amount = Number(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        ingredients: newIngredients
                      }));
                    }}
                  />
                  <TextField
                    label="Единица измерения"
                    value={ing.unit}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].unit = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        ingredients: newIngredients
                      }));
                    }}
                  />
                  <IconButton 
                    onClick={() => {
                      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                      setFormData(prev => ({
                        ...prev,
                        ingredients: newIngredients
                      }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    ingredients: [...prev.ingredients, { name: "", amount: 0, unit: "" }]
                  }));
                }}
              >
                Добавить ингредиент
              </Button>
            </Box>

            <FormControl error={!!formErrors.instructions}>
              <TextField
                multiline
                rows={4}
                label="Инструкции"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  instructions: e.target.value
                }))}
              />
              {formErrors.instructions && (
                <FormHelperText>{formErrors.instructions}</FormHelperText>
              )}
            </FormControl>

            <FormControl>
              <InputLabel>Количество порций</InputLabel>
              <Input
                type="number"
                value={formData.portions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  portions: Number(e.target.value)
                }))}
              />
            </FormControl>

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Загрузить фото
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {formData.image && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveRecipe} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
};

export default App;
